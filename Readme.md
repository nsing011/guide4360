# Task Manager V12

A task management application built with Next.js, Prisma, MongoDB, and React.

## Prerequisites

- Node.js 18+ 
- pnpm 10.4.1+
- MongoDB connection string

## Installation

### Mac/Linux Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd task-manager-v12

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your MongoDB URL

# Run migrations
pnpm prisma migrate deploy

# Start development server
pnpm dev
```

### Windows Setup (SSL Certificate Fix)

Windows may encounter SSL certificate errors when Prisma tries to download engine binaries. This project is pre-configured to handle this:

#### Option 1: Automatic (Recommended)
```powershell
# PowerShell
$env:PRISMA_SKIP_ENGINE_CHECK='true'
pnpm install
pnpm dev
```

#### Option 2: Command Prompt
```cmd
SET PRISMA_SKIP_ENGINE_CHECK=true
pnpm install
pnpm dev
```

#### Option 3: Create .env.local (Persistent)
Create a `.env.local` file in the project root:
```
PRISMA_SKIP_ENGINE_CHECK=true
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

Then run:
```powershell
pnpm install
pnpm dev
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB Connection String
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# Prisma (Optional - for Windows)
PRISMA_SKIP_ENGINE_CHECK=true

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production
```

See `.env.example` for all available configuration options.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm prisma:migrate:deploy` - Deploy database migrations

## Features

- Task management with scheduling
- Automated tasks
- Pipeline monitoring
- Dashboard with calendar view
- Authentication (login/register)
- Real-time updates

## Deployment to Vercel

This project is ready for deployment to Vercel! 

**For complete deployment instructions, see:**
- 📋 **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment guide
- ✅ **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist to track deployment progress

### Quick Deployment Steps

1. **Prepare code locally**
   ```bash
   pnpm build
   pnpm start
   ```

2. **Push to Git**
   ```bash
   git add .
   git commit -m "chore: prepare for deployment"
   git push origin main
   ```

3. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - Add environment variables:
     - `DATABASE_URL` - Your MongoDB connection string
     - `JWT_SECRET` - A random 32+ character string
   - Click Deploy

4. **Verify deployment**
   - Test login/signup
   - Create a test task
   - Confirm data persists

## Troubleshooting

### Windows SSL Certificate Error
If you encounter "unable to get local issuer certificate" error:

1. **Quick Fix**: Set environment variable before installing
   ```powershell
   $env:PRISMA_SKIP_ENGINE_CHECK='true'
   pnpm install
   ```

2. **Persistent Fix**: Create `.env.local` with `PRISMA_SKIP_ENGINE_CHECK=true`

3. **Check Configuration**:
   - `.npmrc` already has `strict-ssl=false`
   - `package.json` postinstall script includes error handling
   - See `prisma.config.json` for full details

### Database Connection Issues
- Verify MongoDB URL is correct in `.env.local`
- Check network access to MongoDB Atlas (IP whitelist)
- Ensure all required credentials are included

### Build Errors During Deployment
- Check that `DATABASE_URL` is set in Vercel environment variables
- Verify MongoDB credentials are URL-encoded
- See `VERCEL_DEPLOYMENT_GUIDE.md` troubleshooting section

## Architecture

```
/app - Next.js pages and API routes
/components - React components
/lib - Utility functions and types
/prisma - Database schema and migrations
/public - Static assets
```

## Technologies

- Next.js 14
- Prisma ORM
- MongoDB
- React Hook Form
- Tailwind CSS
- TypeScript
- Radix UI Components

## License

MIT
