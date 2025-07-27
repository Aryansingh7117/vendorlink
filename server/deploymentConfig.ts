/**
 * Deployment Configuration and Environment Setup
 * 
 * This module handles production deployment requirements:
 * - Environment variable validation
 * - Database table initialization
 * - Production-specific configurations
 */

import { neon } from "@neondatabase/serverless";

interface DeploymentConfig {
  environment: "development" | "production" | "test";
  requiredEnvVars: Record<string, string | undefined>;
  databaseUrl: string;
  sessionSecret: string;
  replitDomains: string[];
  replId: string;
  issuerUrl: string;
}

/**
 * Validates and returns deployment configuration
 */
export function getDeploymentConfig(): DeploymentConfig {
  const environment = (process.env.NODE_ENV as any) || "development";
  
  const config: DeploymentConfig = {
    environment,
    requiredEnvVars: {
      DATABASE_URL: process.env.DATABASE_URL,
      SESSION_SECRET: process.env.SESSION_SECRET,
      REPLIT_DOMAINS: process.env.REPLIT_DOMAINS,
      REPL_ID: process.env.REPL_ID,
    },
    databaseUrl: process.env.DATABASE_URL || "",
    sessionSecret: process.env.SESSION_SECRET || "",
    replitDomains: process.env.REPLIT_DOMAINS?.split(",").map(d => d.trim()) || [],
    replId: process.env.REPL_ID || "",
    issuerUrl: process.env.ISSUER_URL || "https://replit.com/oidc",
  };

  // Validate required environment variables
  const missingVars = Object.entries(config.requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables for deployment:");
    missingVars.forEach(varName => {
      console.error(`   - ${varName}: ${getEnvVarDescription(varName)}`);
    });
    
    if (environment === "production") {
      throw new Error(`Production deployment failed: Missing environment variables: ${missingVars.join(", ")}`);
    } else {
      console.warn("⚠️  Some environment variables are missing. Application may not work correctly in production.");
    }
  } else {
    console.log("✅ All required environment variables are configured");
  }

  return config;
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
    case "ISSUER_URL":
      return "OpenID Connect issuer URL (defaults to https://replit.com/oidc)";
    default:
      return "Required for application functionality";
  }
}

/**
 * Initialize database tables required for the application
 */
export async function initializeDatabase(databaseUrl: string): Promise<void> {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database initialization");
  }

  try {
    console.log("🔧 Initializing database tables...");
    const sql = neon(databaseUrl);

    // Create sessions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire);
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS sessions_sid_idx ON sessions (sid);
    `;

    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Validate deployment readiness
 */
export async function validateDeployment(): Promise<boolean> {
  try {
    console.log("🚀 Validating deployment readiness...");
    
    const config = getDeploymentConfig();
    
    // Test database connection
    if (config.databaseUrl) {
      await initializeDatabase(config.databaseUrl);
    }
    
    // Validate domain configuration
    if (config.replitDomains.length === 0) {
      throw new Error("At least one domain must be specified in REPLIT_DOMAINS");
    }
    
    // Validate session secret strength
    if (config.sessionSecret && config.sessionSecret.length < 32) {
      console.warn("⚠️  SESSION_SECRET should be at least 32 characters for production security");
    }
    
    console.log("✅ Deployment validation completed successfully");
    console.log(`   Environment: ${config.environment}`);
    console.log(`   Domains: ${config.replitDomains.join(", ")}`);
    console.log(`   Database: ${config.databaseUrl ? "Connected" : "Not configured"}`);
    
    return true;
  } catch (error) {
    console.error("❌ Deployment validation failed:", error);
    return false;
  }
}

/**
 * Setup for development environment
 */
export function setupDevelopmentEnvironment(): void {
  if (process.env.NODE_ENV !== "development") return;
  
  console.log("🛠️  Development environment detected");
  
  // Set development defaults if not provided
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = "development-session-secret-not-for-production-use";
    console.log("   Using development session secret");
  }
  
  if (!process.env.REPLIT_DOMAINS) {
    process.env.REPLIT_DOMAINS = "localhost:3000";
    console.log("   Using localhost development domain");
  }
}