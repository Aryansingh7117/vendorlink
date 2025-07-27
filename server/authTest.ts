/**
 * Authentication Testing and Debugging Routes
 */

import type { Express } from "express";

export function setupAuthTestRoutes(app: Express) {
  // Test route to check authentication status
  app.get("/api/auth/debug", (req, res) => {
    const user = req.user as any;
    
    res.json({
      isAuthenticated: req.isAuthenticated(),
      sessionId: req.sessionID,
      session: {
        hasSession: !!req.session,
        sessionData: req.session ? Object.keys(req.session) : [],
      },
      user: {
        hasUser: !!user,
        userId: user?.id,
        hasClaimsa: !!(user?.claims),
        hasClaims: !!(user?.claims),
        hasAccessToken: !!(user?.access_token),
        hasRefreshToken: !!(user?.refresh_token),
        expiresAt: user?.expires_at,
        currentTime: Math.floor(Date.now() / 1000),
        isExpired: user?.expires_at ? Math.floor(Date.now() / 1000) > user.expires_at : null,
      },
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
        cookie: !!req.headers.cookie,
      }
    });
  });

  // Test callback simulation
  app.get("/api/auth/test-callback", (req, res) => {
    res.json({
      message: "This is a test callback endpoint",
      query: req.query,
      hostname: req.hostname,
      protocol: req.protocol,
      originalUrl: req.originalUrl,
    });
  });
}