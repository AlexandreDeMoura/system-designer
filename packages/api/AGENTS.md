# API Package (@sd/api) - Golden Paths

This file contains step-by-step recipes for the shared tRPC router and types.

---

## Add a New tRPC Procedure

1. **Define the procedure** in `src/index.ts`:

   ```typescript
   // Query example
   getItems: protectedProcedure
     .input(z.object({ limit: z.number().optional() }))
     .query(async ({ input, ctx }) => {
       const { data, error } = await ctx.supabase
         .from("items")
         .select("*")
         .limit(input.limit ?? 50);
       if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
       return data;
     }),

   // Mutation example
   createItem: protectedProcedure
     .input(z.object({ name: z.string().min(1) }))
     .mutation(async ({ input, ctx }) => {
       const { data, error } = await ctx.supabase
         .from("items")
         .insert({ name: input.name, user_id: ctx.user.id })
         .select()
         .single();
       if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
       return data;
     }),
   ```

2. **Rebuild the API package** — the dev script auto-rebuilds, but verify no TypeScript errors.

3. **Use in frontend** via tRPC hooks (see `apps/web/AGENTS.md`).

---

## Add a Streaming AI Procedure

1. **Create the procedure** using async generator:

   ```typescript
   myStreamingFeature: publicProcedure
     .input(z.object({ prompt: z.string() }))
     .mutation(async function* ({ input }): AsyncGenerator<StreamChunk> {
       const systemPrompt = `Your system prompt here...`;

       for await (const chunk of getLLMProvider().streamChat(
         [{ role: 'user', content: input.prompt }],
         systemPrompt
       )) {
         yield chunk;
       }
     }),
   ```

2. **StreamChunk types** are already exported from `src/llm/types.ts`:

   ```typescript
   export interface StreamChunk {
     type: 'text_delta' | 'done' | 'error'
     content?: string
     error?: string
   }
   ```

---

## Add a New Database Table

1. **Create migration file** (from repo root):

   ```bash
   npx supabase migration new create_items
   ```

2. **Write the migration** in `supabase/migrations/<timestamp>_create_items.sql`:

   ```sql
   -- Create the items table
   create table public.items (
     id bigint generated always as identity primary key,
     user_id uuid not null references auth.users (id) on delete cascade,
     name text not null,
     created_at timestamptz not null default now()
   );

   -- Add comments
   comment on table public.items is 'User-owned items.';
   comment on column public.items.name is 'Display name of the item.';

   -- Enable RLS
   alter table public.items enable row level security;

   -- RLS policies for authenticated users
   create policy "users can select own items"
     on public.items for select to authenticated
     using (auth.uid() = user_id);

   create policy "users can insert own items"
     on public.items for insert to authenticated
     with check (auth.uid() = user_id);

   create policy "users can delete own items"
     on public.items for delete to authenticated
     using (auth.uid() = user_id);

   -- RLS policies for anon (deny all)
   create policy "anon cannot access items"
     on public.items for all to anon
     using (false);

   -- Index for faster lookups
   create index items_user_id_idx on public.items (user_id);
   ```

3. **Apply migration**: `npx supabase db reset` (local) or `npx supabase db push` (remote).

4. **Add TypeScript type** in `src/supabase.ts`:

   ```typescript
   export interface Item {
     id: number;
     user_id: string;
     name: string;
     created_at: string;
   }
   ```

   Or generate types: `npx supabase gen types typescript --local > src/database.types.ts`

5. **Create tRPC procedures** to interact with the table (see above).

---

## Add a New LLM Provider

1. **Create provider file** in `src/llm/<provider>-provider.ts`:

   ```typescript
   import type { LLMProvider, ChatMessage, StreamChunk, LLMProviderConfig } from './types.js'

   export class MyProvider implements LLMProvider {
     constructor(config: LLMProviderConfig) {
       // Initialize client
     }

     async *streamChat(
       messages: ChatMessage[],
       systemPrompt?: string
     ): AsyncGenerator<StreamChunk, void, unknown> {
       // Implement streaming
       yield { type: 'text_delta', content: 'Hello' };
       yield { type: 'done' };
     }
   }
   ```

2. **Register in factory** in `src/llm/index.ts`:

   ```typescript
   import { MyProvider } from './my-provider.js'

   export function createLLMProvider(type: string, config: LLMProviderConfig): LLMProvider {
     switch (type) {
       case 'anthropic':
         return new AnthropicProvider(config);
       case 'my-provider':
         return new MyProvider(config);
       default:
         throw new Error(`Unknown LLM provider: ${type}`);
     }
   }
   ```

---

## Export New Types

When adding types that should be accessible to `@sd/web` or `@sd/server`:

1. **Define type** in appropriate file (`src/supabase.ts`, `src/llm/types.ts`, etc.)

2. **Export from `src/index.ts`**:

   ```typescript
   export type { MyNewType } from './my-file.js';
   ```

3. **Rebuild**: The dev script watches, but run `npm -w @sd/api run build` to verify.

