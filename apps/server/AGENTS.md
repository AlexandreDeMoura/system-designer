# Server (@sd/server) - Golden Paths

This file contains context and recipes for the Fastify server.

---

## Overview

The server is a thin Fastify layer that:
- Hosts the tRPC router from `@sd/api`
- Creates request context with Supabase client and user from Bearer token
- Handles CORS for the frontend

All business logic lives in `@sd/api` — the server just wires things together.

---

## Server Context Creation

The server extracts the Bearer token and creates a Supabase client with user context:

```typescript
async function createContext({ req }: { req: FastifyRequest }): Promise<Context> {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const supabase = createSupabaseClient();
  let user: Context["user"] = null;

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) {
      user = data.user;
    }
  }

  return {
    user,
    supabase: user ? createSupabaseClient(accessToken) : supabase,
  };
}
```

---

## Environment Variables

The server loads `.env` from `apps/server/.env`. Required variables:

```bash
# Supabase
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (for LLM features)
ANTHROPIC_API_KEY=your-api-key

# Server
PORT=3000
```

---

## Adding Middleware

To add Fastify middleware (rate limiting, logging, etc.):

```typescript
import rateLimit from '@fastify/rate-limit'

// Before registering tRPC plugin
await server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
})
```

---

## CORS Configuration

Currently configured for local development:

```typescript
await server.register(cors, {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  allowedHeaders: ["authorization", "content-type"],
});
```

Update `origin` array for production deployments.

