# AGENTS.md

## Product Intent

System Designer is an interactive decision-making tool for developers navigating modern web architecture choices. It presents a curated catalog of system design decisions (frameworks, databases, auth strategies, deployment models, etc.), organized by category and development phase, with each decision offering multiple options alongside their pros, cons, and "best when" guidance. Users can engage in AI-assisted conversations about any decision to explore tradeoffs in the context of their specific requirements. The app targets developers and tech leads who need to make informed architectural choices for new projects or evaluate alternatives for existing systems—what matters is clarity, accuracy of tradeoff information, and genuinely helpful AI guidance that understands the nuances of each technology choice.

---

## Non-Negotiables & Constraints

### Data Fetching & Server State

- **All server state via tRPC + React Query hooks.** Use `trpc.<procedure>.useQuery()` for reads and `trpc.<procedure>.useMutation()` for writes. Never use raw `fetch` or `axios` in UI components.
- **No direct Supabase client calls from components.** All database operations must go through tRPC procedures on the server. The only exception is the `AuthProvider` which uses the Supabase auth client directly for session management.
- **Streaming responses use tRPC async generators.** For AI chat or any streaming data, use `mutation` with `async function*` syntax (tRPC v11 pattern), not WebSockets or custom SSE implementations.

### API & Validation

- **tRPC procedures must validate all inputs with Zod.** Every procedure with input must use `.input(z.object({...}))`. No unvalidated inputs reach business logic.
- **Use `protectedProcedure` for authenticated routes.** Any procedure requiring auth must use the `protectedProcedure` base, not `publicProcedure` with manual checks.
- **Errors surface via TRPCError.** Throw `TRPCError` with appropriate codes (`UNAUTHORIZED`, `NOT_FOUND`, `BAD_REQUEST`, etc.) rather than generic Error objects.

### Authentication

- **Auth state flows through `AuthProvider` → `useAuth()` hook.** Components must use `useAuth()` to access user, session, and auth methods. Never access `supabase.auth` directly in components.
- **Access token sync via `authStore`.** The tRPC client reads the token from the module-level `authStore` (set by `AuthProvider`). This bridges React context with the tRPC client created outside the component tree.
- **Supabase RLS is the source of truth.** Server-side authorization relies on Row Level Security policies. The tRPC procedures pass the Supabase client with user context; RLS handles row-level access control.

### Code Organization

- **Monorepo with npm workspaces.** Packages: `@sd/api` (shared tRPC router, types, LLM abstraction), `@sd/web` (React frontend), `@sd/server` (Fastify server). Changes to shared types go in `@sd/api`.
- **Hooks live in `hooks/` directory.** Complex stateful logic (like `useChat`) belongs in dedicated hook files, not inline in components.
- **Types in dedicated `types.ts` files.** Shared frontend types go in `apps/web/src/types.ts`. API types are exported from `@sd/api`.
- **Static data (categories, decisions) in `assets/`.** The decision catalog lives in `assets/categories.ts`, not fetched from an API (for now).

### Styling & UI

- **Tailwind CSS only.** No CSS modules, styled-components, or inline style objects. Use Tailwind utility classes and the project's design tokens.
- **Dark theme is default.** The app uses a dark blueprint aesthetic. Maintain consistent color palette using the established hex values (`#0c1018`, `#1a2332`, `#2a3a4a`, etc.).
- **Modals use `createPortal`.** Modal components render via `createPortal(jsx, document.body)` to escape parent stacking contexts.
- **Use `lucide-react` for icons.** No other icon libraries.

### TypeScript & Quality

- **Strict TypeScript throughout.** No `any` types except in rare, documented cases. Use proper type inference where possible.
- **Zod schemas are the source of truth for runtime types.** Derive TypeScript types from Zod schemas using `z.infer<typeof schema>` when applicable.
- **React 19 with React Compiler enabled.** The compiler handles memoization; avoid manual `useMemo`/`useCallback` unless profiling shows necessity.

### Database & Migrations

- **Supabase migrations in `supabase/migrations/`.** All schema changes via numbered migration files. Never modify the database directly.
- **RLS policies for every table.** Tables must have Row Level Security enabled with explicit policies for all operations and user types (authenticated, anon).
- **Comments on tables and columns.** Migrations should include `COMMENT ON` statements explaining purpose.

### LLM Integration

- **LLM calls go through the provider abstraction.** Use `LLMProvider` interface from `@sd/api/llm`. Currently Anthropic, but abstraction allows swapping providers.
- **System prompts include decision context.** When generating AI responses, the system prompt must include the current decision's title, description, options, and guiding questions.

---

## Commands

### Development

```bash
# Install all dependencies (run from repo root)
npm install

# Start all services concurrently (API watch, Web dev server, Server with hot reload)
npm run dev

# Start individual packages
npm -w @sd/web run dev      # Vite dev server on http://localhost:5173
npm -w @sd/server run dev   # Fastify server on http://localhost:3000 (tsx watch)
npm -w @sd/api run dev      # TypeScript watch mode for shared package
```

### Build & Typecheck

```bash
# Build all packages (api → server → web)
npm run build

# Build individual packages
npm -w @sd/api run build
npm -w @sd/server run build
npm -w @sd/web run build

# Typecheck (via build, no separate tsc script)
npm -w @sd/api run build    # Typechecks @sd/api
npm -w @sd/web run build    # Runs tsc -b before vite build
```

### Linting

```bash
# Lint all workspaces
npm run lint

# Lint web app only (ESLint with TypeScript + React rules)
npm -w @sd/web run lint
```

### Database (Supabase)

```bash
# Start local Supabase (Docker required)
npx supabase start

# Create a new migration
npx supabase migration new <migration_name>

# Apply migrations to local database
npx supabase db reset

# Push migrations to remote (linked project)
npx supabase db push

# Generate TypeScript types from database schema
npx supabase gen types typescript --local > packages/api/src/database.types.ts
```

