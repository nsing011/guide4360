# Deployment Checklist - Task Manager V12

## Pre-Deployment ✓

- [x] Dependencies locked to specific versions (not "latest")
- [x] `.env.example` created with all required variables
- [x] `.env.local` template created for local development
- [x] ESLint and TypeScript errors documented in next.config.mjs
- [x] Prisma schema validated and migrations up to date
- [x] Build configured for production
- [x] React Strict Mode enabled
- [x] Source maps disabled for production

## Local Testing

- [ ] Run `pnpm install` to verify dependencies
- [ ] Run `pnpm build` to verify build succeeds
- [ ] Run `pnpm start` to test production build locally
- [ ] Test authentication flow (login/register)
- [ ] Test task creation and management
- [ ] Check browser console for errors
- [ ] Verify all API routes work

## Git Preparation

- [ ] Review all code changes: `git status`
- [ ] Stage changes: `git add .`
- [ ] Commit changes: `git commit -m "chore: prepare for Vercel deployment"`
- [ ] Push to main: `git push origin main`
- [ ] Verify on GitHub/GitLab/Bitbucket

## Vercel Setup

- [ ] Create account at https://vercel.com
- [ ] Connect Git provider (GitHub/GitLab/Bitbucket)
- [ ] Import repository
- [ ] Select "Next.js" framework preset
- [ ] Leave build command as default

## Environment Variables in Vercel

Add these in Vercel Project Settings → Environment Variables:

- [ ] `DATABASE_URL` - MongoDB connection string
  - Format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
  - Get from: MongoDB Atlas → Connect → Copy connection string
  - Replace `<password>` and `<database_name>`

- [ ] `JWT_SECRET` - Secure authentication secret
  - Generate: `openssl rand -base64 32`
  - Must be 32+ characters
  - Must be different from local development

- [ ] (Optional) `PRISMA_SKIP_ENGINE_CHECK` - Only if SSL errors occur
  - Set to: `false` (default is fine)

## MongoDB Atlas Setup

- [ ] Create MongoDB cluster at https://cloud.mongodb.com
- [ ] Create database user with strong password
- [ ] Add Vercel IP to network access (or allow 0.0.0.0/0)
- [ ] Verify connection string is correct
- [ ] Test connection locally before deploying

## Deployment

- [ ] In Vercel, click "Deploy"
- [ ] Wait for build to complete (takes 2-5 minutes)
- [ ] Verify deployment succeeded
- [ ] Scroll through build logs for any warnings
- [ ] Note the provided URL

## Post-Deployment Testing

- [ ] Visit the deployment URL
- [ ] Test signup/login flow
- [ ] Create a new task
- [ ] Verify task appears in dashboard
- [ ] Check that calendar view works
- [ ] Test automated tasks section
- [ ] Test pipeline monitoring section
- [ ] Check browser console (F12) for errors
- [ ] Test on mobile device
- [ ] Verify database is saving data (add task, refresh, verify it's still there)

## Custom Domain (Optional)

- [ ] Purchase domain from registrar
- [ ] In Vercel: Project Settings → Domains
- [ ] Add custom domain
- [ ] Update DNS records per Vercel instructions
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify SSL certificate provisioned automatically

## Monitoring & Maintenance

- [ ] Set up Vercel alerts: Project → Settings → Alerts
- [ ] Monitor MongoDB Atlas dashboard
- [ ] Check Vercel Analytics if enabled
- [ ] Review build logs for any recurring warnings
- [ ] Plan for technical debt fixes
- [ ] Set up status page (optional)

## Post-Deployment Improvements

Once deployed and working, gradually address:

- [ ] Fix ESLint warnings (run `pnpm lint`)
- [ ] Fix TypeScript errors (run `pnpm tsc`)
- [ ] Remove `ignoreBuildErrors: true` from next.config.mjs
- [ ] Remove `ignoreDuringBuilds: true` from next.config.mjs
- [ ] Add automated testing
- [ ] Set up CI/CD with test runs
- [ ] Implement Sentry error tracking
- [ ] Add database backups monitoring

## Success Criteria

✅ Deployment is successful when:
- Live URL is accessible
- Login page loads
- Can create an account
- Can create a task
- Tasks persist after refresh
- No critical errors in browser console
- Database is receiving and saving data

---

**Deployment Date**: _______________
**Vercel URL**: _______________
**Custom Domain**: _______________
**MongoDB Atlas Cluster**: _______________
**Notes**: _______________________________________________

