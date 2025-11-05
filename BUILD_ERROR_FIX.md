# 🔧 Build Error Fix - Routes Manifest Missing

## Error Message
```
Error: The file "/vercel/path0/.next/routes-manifest.json" couldn't be found
```

## What It Means

The build process failed and didn't create the required Next.js files. This happens when `pnpm build` fails during the Vercel build.

## Common Causes (In Order of Likelihood)

### 1. ❌ DATABASE_URL Not Set (Most Common)
**Issue:** Prisma tries to connect to MongoDB during build to generate the client.

**Solution:**
1. Go to Vercel project settings
2. Go to "Environment Variables"
3. Verify `DATABASE_URL` is set
4. Verify it's not empty or truncated
5. Click Redeploy

### 2. ❌ Invalid MongoDB Connection String
**Issue:** DATABASE_URL is set but has a typo or is malformed

**Solution:**
1. Copy your MongoDB connection string from MongoDB Atlas
2. Verify format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
3. Verify special characters are URL-encoded
4. Update in Vercel and redeploy

### 3. ❌ MongoDB Network Access Blocked
**Issue:** Vercel server can't reach MongoDB

**Solution:**
1. Go to MongoDB Atlas
2. Go to Network Access (Security section)
3. Add IP address 0.0.0.0/0 (allows all IPs)
4. OR add Vercel's IP range (check Vercel docs)
5. Wait 5-10 minutes for changes to propagate
6. Redeploy

### 4. ❌ JWT_SECRET Not Set
**Issue:** Build needs JWT_SECRET for configuration

**Solution:**
1. Generate: `openssl rand -base64 32`
2. Add to Vercel environment variables
3. Redeploy

## How to Debug

### Step 1: Check Build Logs
1. Go to https://vercel.com/dashboard
2. Click your project
3. Click "Deployments"
4. Click on the failed deployment
5. Scroll down to see "Build Output" or "Build Logs"
6. Read the error message carefully

### Step 2: Look for Error Messages Like:
```
Error: Environment variable DATABASE_URL is not set
Error: Can't reach database
getaddrinfo ENOTFOUND mongodb
MongoServerSelectionError
```

### Step 3: Verify All Environment Variables

In Vercel, under Environment Variables, you should see:
- ✓ DATABASE_URL (with your actual connection string)
- ✓ JWT_SECRET (with your secret key)
- ✗ PRISMA_SKIP_ENGINE_CHECK (don't add this - not needed)

## Step-by-Step Fix

### Step 1: Fix Environment Variables
```
DATABASE_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DB?retryWrites=true&w=majority
JWT_SECRET=your-randomly-generated-32-character-secret-here
```

### Step 2: Test Local Build (Optional)
```bash
# Create .env.local locally with real values
cd /Users/narayxnnn/Developer/task-manager-v12-kenvue
echo "DATABASE_URL=your-connection-string" > .env.local
echo "JWT_SECRET=your-secret" >> .env.local

# Try building locally
pnpm build

# Check if it succeeds
```

### Step 3: Redeploy on Vercel
1. Go to Vercel dashboard
2. Find your project
3. Click "Deployments"
4. Find the failed deployment
5. Click "Redeploy" button
6. Watch the build logs

### Step 4: Monitor Build Progress
- Look for `✓ Compiled successfully` message
- Look for `✓ Generating static pages` message
- Look for `✓ Generated routes manifest` message
- If you see these, deployment should work

## Timeline
- If fix works: 5-10 minutes total build time
- Then: 1-2 minutes for deployment
- Total: 10-15 minutes

## Advanced Troubleshooting

### If you see: "Prisma Error"
```
This usually means DATABASE_URL is invalid or unreachable
→ Double-check your MongoDB connection string
→ Verify MongoDB network access
```

### If you see: "Cannot find module"
```
Usually means dependencies aren't installed properly
→ Delete pnpm-lock.yaml again
→ Redeploy (Vercel will regenerate it)
```

### If you see: "TypeScript compilation failed"
```
The app has TypeScript errors, but we ignore them in next.config.mjs
If this appears, it means there's a critical error
→ Check build logs for specific error
→ Can run `pnpm tsc` locally to see issues
```

## MongoDB Atlas Network Access Fix (Detailed)

1. Log into MongoDB Atlas (https://cloud.mongodb.com)
2. Click your cluster
3. Click "Security" tab → "Network Access"
4. Click "Add IP Address" or "+ ADD CURRENT IP"
5. Enter: `0.0.0.0/0` (or specific Vercel IP)
6. Click "Confirm"
7. Wait 5-10 minutes for change to propagate
8. Try Vercel deployment again

## Quick Checklist

- [ ] DATABASE_URL set in Vercel (not empty)
- [ ] DATABASE_URL format is correct
- [ ] JWT_SECRET set in Vercel (not empty)
- [ ] MongoDB network access allows Vercel IPs
- [ ] MongoDB database exists
- [ ] MongoDB user has correct password
- [ ] All special characters in password are URL-encoded

## If All Else Fails

1. **Redeploy** - Sometimes Vercel just needs to try again
2. **Check status** - Is MongoDB Atlas having issues?
3. **Try again in 5 minutes** - Network propagation delays
4. **Nuclear option** - Delete everything, start fresh:
   - Delete Vercel project
   - Delete MongoDB database
   - Create new database
   - Deploy as new project

## Need More Help?

1. Check VERCEL_DEPLOYMENT_GUIDE.md - Troubleshooting section
2. Check Vercel build logs (most detailed info)
3. Check MongoDB Atlas status page
4. See the error message in Vercel logs - it will tell you exactly what's wrong

---

**Most Common Solution:** Set DATABASE_URL correctly in Vercel and redeploy.

That fixes this error ~80% of the time.

---

**Status:** ⚠️ **Build failed - environment variable issue likely**

Read build logs in Vercel, check environment variables, and redeploy.
