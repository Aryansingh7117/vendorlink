import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Environment variable validation with helpful error messages
const requiredEnvVars = {
  REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
  REPL_ID: process.env.REPL_ID,
  SESSION_SECRET: process.env.SESSION_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("Missing required environment variables:", missingVars.join(", "));
  console.error("Please ensure these environment variables are set in your deployment configuration:");
  missingVars.forEach(varName => {
    console.error(`- ${varName}: ${getEnvVarDescription(varName)}`);
  });
  throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
}

function getEnvVarDescription(varName: string): string {
  switch (varName) {
    case "REPLIT_DOMAINS":
      return "Comma-separated list of domains for OAuth callbacks (e.g., 'your-app.replit.app')";
    case "REPL_ID":
      return "Your Replit application ID for OpenID Connect authentication";
    case "SESSION_SECRET":
      return "A secure random string for session encryption (minimum 32 characters)";
    case "DATABASE_URL":
      return "PostgreSQL connection string for database access";
    default:
      return "Required for application functionality";
  }
}

const getOidcConfig = memoize(
  async () => {
    const issuerUrl = process.env.ISSUER_URL ?? "https://replit.com/oidc";
    const replId = process.env.REPL_ID!;
    
    try {
      return await client.discovery(new URL(issuerUrl), replId);
    } catch (error) {
      console.error("Failed to configure OpenID Connect:", error);
      console.error(`ISSUER_URL: ${issuerUrl}`);
      console.error(`REPL_ID: ${replId}`);
      throw new Error(`OpenID Connect configuration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === "production";
  
  try {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL!,
      createTableIfMissing: true, // Allow table creation for new deployments
      ttl: sessionTtl,
      tableName: "sessions",
    });

    return session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProduction, // Only secure cookies in production
        maxAge: sessionTtl,
        sameSite: isProduction ? "strict" : "lax", // Stricter in production
      },
      name: "vendorlink.sid", // Custom session name
    });
  } catch (error) {
    console.error("Failed to configure session store:", error);
    console.error("DATABASE_URL configured:", !!process.env.DATABASE_URL);
    console.error("SESSION_SECRET configured:", !!process.env.SESSION_SECRET);
    throw new Error(`Session configuration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  try {
    console.log("Setting up authentication...");
    console.log("Environment check:", {
      NODE_ENV: process.env.NODE_ENV,
      REPLIT_DOMAINS: !!process.env.REPLIT_DOMAINS,
      REPL_ID: !!process.env.REPL_ID,
      DATABASE_URL: !!process.env.DATABASE_URL,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
    });

    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    console.log("Configuring OpenID Connect...");
    const config = await getOidcConfig();
    console.log("OpenID Connect configured successfully");

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    console.log("Setting up authentication strategies for domains:", process.env.REPLIT_DOMAINS);
    for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
      const trimmedDomain = domain.trim();
      console.log(`Configuring strategy for domain: ${trimmedDomain}`);
      const strategy = new Strategy(
        {
          name: `replitauth:${trimmedDomain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${trimmedDomain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });

    console.log("Authentication setup completed successfully");
  } catch (error) {
    console.error("Failed to setup authentication:", error);
    throw new Error(`Authentication setup failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
