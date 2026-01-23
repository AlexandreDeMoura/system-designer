# System Designer

An interactive decision-making tool for developers navigating modern web architecture choices. Explore a curated catalog of system design decisions—frameworks, databases, auth strategies, deployment models, and more—with AI-assisted conversations to help you evaluate tradeoffs in the context of your specific requirements.

A live version is available at [system-designer.com](https://system-designer.com).

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Fastify, tRPC v11
- **Database:** Supabase (PostgreSQL + RLS)
- **AI:** Anthropic Claude (via provider abstraction)

## Project Structure

```
packages/
  api/          # Shared tRPC router, types, LLM abstraction (@sd/api)
apps/
  web/          # React frontend (@sd/web)
  server/       # Fastify server (@sd/server)
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
# Fill in your Anthropic API key and Supabase credentials

# Start all services (API watch + Web dev server + Fastify server)
npm run dev
```

The web app runs on `http://localhost:5173` and the API server on `http://localhost:3000`.

## Commands

```bash
# Development
npm run dev                     # Start all services concurrently
npm -w @sd/web run dev          # Web only
npm -w @sd/server run dev       # Server only

# Build & Typecheck
npm run build                   # Build all packages (api → server → web)

# Lint
npm run lint                    # Lint all workspaces

# Database (requires Docker)
npx supabase start              # Start local Supabase
npx supabase migration new <name>  # Create a new migration
npx supabase db reset           # Apply migrations locally
npx supabase db push            # Push migrations to remote
```

## License

MIT
