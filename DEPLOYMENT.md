# VendorLink Deployment Guide

This guide provides comprehensive instructions for deploying VendorLink to production on Replit.

## Required Environment Variables

Before deploying, ensure these environment variables are configured in your Replit deployment settings:

### Authentication Variables
- **REPLIT_DOMAINS**: Comma-separated list of domains for OAuth callbacks
  - Example: `your-app.replit.app` or `your-app.replit.app,your-custom-domain.com`
  - This is the domain where your application will be accessible

- **REPL_ID**: Your Replit application ID for OpenID Connect authentication
  - Found in your Replit project settings
  - Required for user authentication to work

- **ISSUER_URL**: OpenID Connect issuer URL (optional)
  - Defaults to `https://replit.com/oidc`
  - Only set if using a custom OAuth provider

### Security Variables
- **SESSION_SECRET**: A secure random string for session encryption
  - Must be at least 32 characters long
  - Use a cryptographically secure random string
  - Example: `openssl rand -base64 32` to generate one

### Database Variables
- **DATABASE_URL**: PostgreSQL connection string
  - Your Neon PostgreSQL or other PostgreSQL database connection string
  - Format: `postgresql://username:password@host:port/database`

## Deployment Steps

### Step 1: Configure Environment Variables

1. Go to your Replit project
2. Click on "Secrets" in the left sidebar
3. Add each required environment variable:

```bash
# Example values (replace with your actual values)
REPLIT_DOMAINS=your-app-name.replit.app
REPL_ID=your-repl-id-from-settings
SESSION_SECRET=your-secure-32-character-random-string
DATABASE_URL=postgresql://username:password@host:port/database
```

### Step 2: Database Setup

The application will automatically:
- Create the required database tables on first run
- Set up the sessions table for user authentication
- Initialize any missing database structures

### Step 3: Deploy

1. Click the "Deploy" button in your Replit project
2. Choose "Replit Deployments"
3. Configure your deployment settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: 5000 (automatically configured)

### Step 4: Verify Deployment

After deployment, the application will:
1. Validate all environment variables
2. Test database connectivity
3. Initialize required database tables
4. Start the server

Check the deployment logs for confirmation messages:
- ✅ All required environment variables are configured
- ✅ Database tables initialized successfully  
- ✅ Authentication setup completed successfully
- ✅ Deployment validation completed successfully

## Troubleshooting

### Common Deployment Errors

#### Missing Environment Variables
```
Error: Missing environment variables: REPLIT_DOMAINS, REPL_ID
```
**Solution**: Add the missing environment variables in your deployment secrets.

#### Database Connection Issues
```
Error: Database initialization failed
```
**Solution**: 
- Verify your DATABASE_URL is correct
- Ensure your PostgreSQL database is accessible
- Check firewall settings for your database

#### Authentication Setup Failure
```
Error: OpenID Connect configuration failed
```
**Solution**:
- Verify REPL_ID is correct
- Ensure REPLIT_DOMAINS matches your deployment domain
- Check that your Replit project has authentication enabled

#### Session Configuration Issues
```
Error: Session configuration failed
```
**Solution**:
- Verify SESSION_SECRET is at least 32 characters
- Ensure DATABASE_URL is accessible for session storage

### Getting Help

If you encounter deployment issues:

1. Check the deployment logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your database is accessible and has proper credentials
4. Contact Replit support for platform-specific issues

## Post-Deployment

### Custom Domain (Optional)

To use a custom domain:
1. Configure your domain's DNS to point to Replit
2. Add your custom domain to REPLIT_DOMAINS environment variable
3. Update your OAuth callback URLs if necessary

### Monitoring

- Monitor application logs through Replit's logging interface
- Set up database monitoring for your PostgreSQL instance
- Monitor authentication success rates through your logs

### Updates

To update your application:
1. Make changes to your code
2. The deployment will automatically rebuild and redeploy
3. Database migrations will run automatically if needed

## Security Considerations

- Keep your SESSION_SECRET secure and never commit it to version control
- Regularly rotate your SESSION_SECRET for enhanced security
- Use HTTPS for all production deployments (automatically handled by Replit)
- Monitor authentication logs for suspicious activity
- Keep your database credentials secure and use connection pooling

## Performance Optimization

- The application uses PostgreSQL connection pooling for optimal database performance
- Static assets are automatically optimized by Vite during the build process
- Sessions are stored in the database for scalability
- Enable database query optimization for better performance with large datasets