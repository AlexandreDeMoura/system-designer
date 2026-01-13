import superjson from "superjson";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createLLMProvider, type StreamChunk, type LLMProvider } from "./llm/index.js";
import { getSupabase, type Project } from "./supabase.js";

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Lazy initialization to ensure env vars are loaded first
let llmProvider: LLMProvider | null = null;

function getLLMProvider(): LLMProvider {
  if (!llmProvider) {
    llmProvider = createLLMProvider("anthropic", {
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
      model: "claude-sonnet-4-20250514",
      maxTokens: 4096,
    });
  }
  return llmProvider;
}

// Schema for chat messages
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

// Schema for decision context
const decisionContextSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  options: z.array(
    z.object({
      name: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      bestWhen: z.string(),
    })
  ),
  questions: z.array(z.string()),
});

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string().min(1) }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name}!` };
    }),

  // Example: get categories (you can expand this later)
  getCategories: t.procedure.query(() => {
    return { message: "Categories endpoint ready - connect to your data source" };
  }),

  // Get all projects for a user
  getProjects: t.procedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", input.userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      return data as Project[];
    }),

  // Get a single project by id
  getProject: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      return data as Project;
    }),

  // Create a new project
  createProject: t.procedure
    .input(
      z.object({
        userId: z.string().uuid(),
        name: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: input.userId,
          name: input.name,
          description: input.description ?? null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return data as Project;
    }),

  // Streaming chat procedure using async generators (tRPC v11)
  chat: t.procedure
    .input(
      z.object({
        messages: z.array(chatMessageSchema),
        decision: decisionContextSchema,
      })
    )
    .mutation(async function* ({ input }): AsyncGenerator<StreamChunk> {
      const systemPrompt = `You are a helpful system design assistant. You're helping a developer make decisions about their system architecture.

Current Decision Context:
- Decision: ${input.decision.title}
- Description: ${input.decision.description}

Available Options:
${input.decision.options
  .map(
    (opt, i) => `${i + 1}. ${opt.name}
   Pros: ${opt.pros.join(", ")}
   Cons: ${opt.cons.join(", ")}
   Best When: ${opt.bestWhen}`
  )
  .join("\n\n")}

Questions to Consider:
${input.decision.questions.map((q) => `- ${q}`).join("\n")}

Help the user understand the tradeoffs and make an informed decision based on their specific requirements. Be concise but thorough. Ask clarifying questions if needed to give better recommendations.`;

      for await (const chunk of getLLMProvider().streamChat(
        input.messages,
        systemPrompt
      )) {
        yield chunk;
      }
    }),
});

export type AppRouter = typeof appRouter;

// Re-export types for consumers
export type { ChatMessage, StreamChunk } from "./llm/index.js";
export type { Project } from "./supabase.js";
