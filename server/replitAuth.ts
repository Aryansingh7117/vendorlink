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
      try {
        console.log("Verifying authentication tokens...");
        const claims = tokens.claims();
        
        if (!claims) {
          throw new Error("No claims received from authentication");
        }
        
        console.log("User claims received:", { sub: claims.sub, email: claims.email });
        
        const user = {
          id: claims.sub,
          claims: claims,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: claims.exp
        };
        
        await upsertUser(claims);
        console.log("User upserted successfully");
        
        verified(null, user);
      } catch (error) {
        console.error("Authentication verification failed:", error);
        verified(error);
      }
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

    passport.serializeUser((user: any, cb) => {
      console.log("Serializing user:", { hasUser: !!user, hasClaims: !!(user?.claims) });
      cb(null, user);
    });
    
    passport.deserializeUser((user: any, cb) => {
      console.log("Deserializing user:", { hasUser: !!user, hasClaims: !!(user?.claims) });
      cb(null, user);
    });

    app.get("/api/login", (req, res, next) => {
      const hostname = req.hostname;
      const strategyName = `replitauth:${hostname}`;
      
      console.log(`Login attempt for hostname: ${hostname}, strategy: ${strategyName}`);
      console.log(`Available strategies:`, Object.keys((passport as any)._strategies || {}));
      
      // Try to find a matching strategy or use the first available one
      const availableStrategies = Object.keys((passport as any)._strategies || {});
      const matchingStrategy = availableStrategies.find(s => s === strategyName) || 
                               availableStrategies.find(s => s.startsWith('replitauth:'));
      
      if (!matchingStrategy) {
        console.error("No authentication strategy found");
        return res.status(500).json({ message: "Authentication not configured properly" });
      }
      
      console.log(`Using authentication strategy: ${matchingStrategy}`);
      passport.authenticate(matchingStrategy, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      const hostname = req.hostname;
      const strategyName = `replitauth:${hostname}`;
      
      console.log(`Handling callback for hostname: ${hostname}, strategy: ${strategyName}`);
      console.log(`Available strategies:`, Object.keys((passport as any)._strategies || {}));
      
      // Try to find a matching strategy or use the first available one
      const availableStrategies = Object.keys((passport as any)._strategies || {});
      const matchingStrategy = availableStrategies.find(s => s === strategyName) || 
                               availableStrategies.find(s => s.startsWith('replitauth:'));
      
      if (!matchingStrategy) {
        console.error("No authentication strategy found for callback");
        return res.status(500).json({ message: "Authentication callback failed - no strategy" });
      }
      
      console.log(`Using callback strategy: ${matchingStrategy}`);
      passport.authenticate(matchingStrategy, (err: any, user: any, info: any) => {
        if (err) {
          console.error("Authentication error:", err);
          return res.redirect("/api/login?error=auth_failed");
        }
        
        if (!user) {
          console.error("Authentication failed - no user:", info);
          return res.redirect("/api/login?error=no_user");
        }
        
        req.logIn(user, (loginErr: any) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return res.redirect("/api/login?error=login_failed");
          }
          
          console.log("Authentication successful, user logged in:", {
            userId: user.id,
            hasSession: !!req.session,
            sessionId: req.sessionID
          });
          
          return res.redirect("/");
        });
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

  console.log("Authentication check:", { 
    isAuthenticated: req.isAuthenticated(), 
    hasUser: !!user, 
    hasExpiry: !!(user?.expires_at),
    hasClaims: !!(user?.claims)
  });

  if (!req.isAuthenticated() || !user || !user.expires_at) {
    console.log("Authentication failed: missing session or expiry");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    console.log("Authentication successful: token still valid");
    return next();
  }

  console.log("Token expired, attempting refresh...");
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    console.log("No refresh token available");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    
    // Update user session with new tokens
    user.claims = tokenResponse.claims();
    user.access_token = tokenResponse.access_token;
    user.refresh_token = tokenResponse.refresh_token;
    user.expires_at = user.claims?.exp;
    
    console.log("Token refreshed successfully");
    return next();
  } catch (error) {
    console.error("Token refresh failed:", error);
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
