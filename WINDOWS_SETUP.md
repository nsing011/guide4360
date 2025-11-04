# Windows Setup Guide for Task Manager V12

## Problem: SSL Certificate Error During Installation

When running `pnpm install` or `npx prisma generate` on Windows, you may see:

```
Error: request to https://binaries.prisma.sh/... failed
reason: unable to get local issuer certificate
```

This is NOT related to your MongoDB connection - it's a **Prisma engine binary download issue**.

---

## Solutions (Try in Order)

### ✅ Solution 1: Set Environment Variable (Quickest)

**For PowerShell:**
```powershell
$env:PRISMA_SKIP_ENGINE_CHECK='true'
pnpm install
pnpm dev
```

**For Command Prompt (cmd.exe):**
```cmd
SET PRISMA_SKIP_ENGINE_CHECK=true
pnpm install
pnpm dev
```

---

### ✅ Solution 2: Persistent Configuration (.env.local)

Create a file named `.env.local` in the project root:

```
PRISMA_SKIP_ENGINE_CHECK=true
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
```

Then run normally:
```powershell
pnpm install
pnpm dev
```

---

### ✅ Solution 3: Update .npmrc (Already Done)

The project already has `.npmrc` configured with:
```ini
strict-ssl=false
legacy-peer-deps=true
```

This should help, but may not completely solve Prisma engine downloads.

---

## What's Happening?

1. **pnpm install** runs the `postinstall` script from `package.json`
2. This script tries to run `prisma generate`
3. Prisma needs to download engine binaries from `https://binaries.prisma.sh/`
4. Windows SSL verification fails (often due to firewalls, proxies, or antivirus)
5. `PRISMA_SKIP_ENGINE_CHECK=true` tells Prisma to skip this download and use a cached version

---

## Step-by-Step Setup for Windows

```powershell
# 1. Clone the repository
git clone <repository-url>
cd task-manager-v12

# 2. Set Prisma flag
$env:PRISMA_SKIP_ENGINE_CHECK='true'

# 3. Install dependencies
pnpm install

# 4. Create .env.local with your MongoDB credentials
# (You can copy from .env.example if it exists)
# Edit the file and add your actual MongoDB URL

# 5. Run migrations (optional)
pnpm prisma migrate deploy

# 6. Start dev server
pnpm dev

# 7. Open browser to http://localhost:3000
```

---

## Verify Installation

After setup, check that everything works:

```powershell
# Check Prisma is available
npx prisma --version

# Check Next.js is available
pnpm next --version

# Start dev server
pnpm dev
```

---

## If Still Having Issues

### Check Node/pnpm versions:
```powershell
node --version        # Should be 18+
pnpm --version        # Should be 10.4.1+
```

### Check npm/pnpm config:
```powershell
npm config list
pnpm config list
```

### Clear cache and retry:
```powershell
$env:PRISMA_SKIP_ENGINE_CHECK='true'
pnpm store prune
pnpm install --force
```

### Check if it's a firewall/proxy issue:
```powershell
# Try to access Prisma binaries directly
curl https://binaries.prisma.sh/
```

If curl fails, your network may be blocking Prisma downloads. Discuss with your IT team about:
- Firewall exceptions for binaries.prisma.sh
- Proxy configuration
- Antivirus SSL interception

---

## Permanent Fix (For Future Use)

Everything is already configured:
- ✅ `.npmrc` has `strict-ssl=false`
- ✅ `package.json` postinstall handles errors gracefully
- ✅ `prisma.config.json` documents Windows settings
- ✅ `README.md` has Windows setup instructions

Just set the environment variable or create `.env.local` with `PRISMA_SKIP_ENGINE_CHECK=true` before running `pnpm install`.

---

## Troubleshooting Matrix

| Error | Cause | Solution |
|-------|-------|----------|
| SSL Certificate | Firewall/network | Set `PRISMA_SKIP_ENGINE_CHECK=true` |
| MongoDB Connection | Wrong credentials | Check `.env.local` DATABASE_URL |
| Port 3000 in use | Another app running | Kill process or change port |
| Missing dependencies | Incomplete install | Run `pnpm install --force` |
| Prisma client not found | Engine not generated | Set env var and reinstall |

---

## Additional Help

- Check `prisma.config.json` for more configuration options
- See `README.md` for general setup
- Check Prisma docs: https://www.prisma.io/docs/
- MongoDB docs: https://docs.mongodb.com/

---

**Last Updated:** November 2025  
**Compatible With:** Windows 10+, Node 18+, pnpm 10.4.1+
