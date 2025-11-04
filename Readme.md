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
