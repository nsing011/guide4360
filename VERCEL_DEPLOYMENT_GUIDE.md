# Vercel Deployment Guide

This guide will help you deploy the Task Manager application to Vercel.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **MongoDB Atlas Account**
   - Create a free cluster at https://cloud.mongodb.com
   - Get your MongoDB connection string (with username and password)

2. **GitHub/GitLab/Bitbucket Account**
   - Push your code to one of these platforms
   - Vercel will pull from your repository

3. **Vercel Account**
   - Sign up at https://vercel.com
   - Link your Git provider

## Step-by-Step Deployment

### 1. Prepare Your Code

```bash
# Make sure you're on the main branch
git checkout main

# Verify all dependencies are installed and locked
pnpm install

# Test the build locally
pnpm build
pnpm start

# Verify no critical errors (TypeScript/ESLint warnings are acceptable)
pnpm lint
```

### 2. Push to Git Repository

```bash
# Add all changes
git add .

# Commit the deployment-ready code
git commit -m "chore: prepare for Vercel deployment - lock dependencies and add env config"

# Push to main branch
git push origin main
```

### 3. Connect to Vercel

1. Go to https://vercel.com/new
2. Select your Git provider (GitHub, GitLab, or Bitbucket)
3. Choose the `task-manager-v12-kenvue` repository
4. Click "Import"

### 4. Configure Environment Variables

In the Vercel deployment form, add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your MongoDB connection string | Get from MongoDB Atlas |
| `JWT_SECRET` | A strong random string (32+ chars) | Generate: `openssl rand -base64 32` |
| `PRISMA_SKIP_ENGINE_CHECK` | `false` | Only set to `true` if you encounter SSL errors |

**Important**: Never commit your actual environment variables to Git!

### 5. Additional Build Settings (Optional)

These are usually auto-detected, but you can verify:

- **Framework Preset**: Next.js
- **Build Command**: Leave as default or use `pnpm build`
- **Output Directory**: Leave as default (.next)
- **Install Command**: Leave as default or use `pnpm install`

### 6. Deploy

Click "Deploy" and Vercel will:
1. Install dependencies
2. Run `pnpm build`
3. Deploy to the Vercel edge network
4. Provide you with a live URL

### 7. Test Your Deployment

1. Visit the provided Vercel URL
2. Test the login/registration flow
3. Create a test task to verify database connectivity
4. Check browser console for any errors

## Environment Variables Guide

### DATABASE_URL

Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority`

To get this from MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Navigate to your cluster
3. Click "Connect"
4. Select "Drivers"
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Replace `<database_name>` with your database name

### JWT_SECRET

A secret key used to sign JWT tokens for authentication. Must be:
- At least 32 characters long
- Randomly generated
- Kept secure (never commit to Git)
- Different for production and staging

Generate one:
```bash
openssl rand -base64 32
```

## Troubleshooting

### Build Fails with "Prisma Generate" Error

If the build fails during Prisma generation:

1. Check MongoDB connection string is correct
2. Ensure the database exists in MongoDB Atlas
3. Add `PRISMA_SKIP_ENGINE_CHECK=true` to environment variables

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas IP whitelist includes Vercel's IP (or allow all with 0.0.0.0/0)
- Ensure username/password are URL-encoded (use MongoDB's copy button)

### TypeScript/ESLint Build Warnings

These are ignored during production builds. To fix them locally:

```bash
# See all ESLint issues
pnpm lint

# See TypeScript issues
pnpm tsc

# Fix them gradually and remove the build ignores from next.config.mjs
```

### Authentication Not Working

1. Verify `JWT_SECRET` is set in environment variables
2. Check that users table exists in MongoDB
3. Try creating a new user account
4. Check browser console for specific error messages

## Monitoring & Maintenance

### Vercel Analytics

Once deployed, you can enable analytics in Vercel:
1. Go to your Vercel project settings
2. Enable "Web Analytics" (free tier available)
3. View performance metrics at vercel.com

### Database Backups

With MongoDB Atlas:
1. Set up automatic daily backups (included in free tier)
2. Keep your connection string secure
3. Periodically check backup status in Atlas

### Performance Optimization

Vercel automatically optimizes your site through:
- Edge caching
- Automatic image optimization
- Code splitting
- ISR (Incremental Static Regeneration) for API routes

## Advanced Configuration

### Custom Domain

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as directed by Vercel
4. SSL certificate is automatically provisioned

### Staging Environment

1. Create a `staging` branch in Git
2. Create a new Vercel project pointing to the staging branch
3. Use different environment variables for staging

### CI/CD Integration

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

## Security Best Practices

1. **Never commit `.env` or `.env.local`** - These are in `.gitignore`
2. **Use strong `JWT_SECRET`** - At least 32 random characters
3. **Enable MongoDB IP whitelist** - Allow only Vercel IPs
4. **Rotate credentials periodically** - Every 90 days recommended
5. **Monitor access logs** - Use Vercel and MongoDB Atlas dashboards

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Prisma Docs**: https://www.prisma.io/docs

## Deployment Checklist

- [ ] Code pushed to main branch
- [ ] `.env.example` created and committed
- [ ] MongoDB connection string ready
- [ ] JWT_SECRET generated
- [ ] Vercel account created and Git linked
- [ ] Environment variables added in Vercel
- [ ] Build succeeds locally with `pnpm build`
- [ ] Deployment initiated on Vercel
- [ ] Post-deployment testing completed
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled (if desired)

---

**Last Updated**: November 5, 2025
**Project**: Task Manager V12
**Status**: ✅ Ready for deployment
