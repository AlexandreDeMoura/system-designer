import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";
import {
  createLLMProvider,
  type StreamChunk,
  type LLMProvider,
  type ToolDefinition,
  type ToolCall,
} from "./llm/index.js";
import { type Project, type ProjectDecision } from "./supabase.js";

export type Context = {
  user: User | null;
  supabase: SupabaseClient;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

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

// Schema for project context (optional)
const projectContextSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
});

export const appRouter = t.router({
  hello: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name}!` };
    }),

  // Example: get categories (you can expand this later)
  getCategories: publicProcedure.query(() => {
    return { message: "Categories endpoint ready - connect to your data source" };
  }),

  // Get all projects for a user
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("projects")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data as Project[];
  }),

  // Get a single project by id
  getProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("projects")
        .select("*")
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      return data as Project;
    }),

  // Create a new project
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("projects")
        .insert({
          user_id: ctx.user.id,
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

  getProjectDecisions: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      // First verify the user owns this project
      const { data: project, error: projectError } = await ctx.supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (projectError || !project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const { data, error } = await ctx.supabase
        .from("project_decisions")
        .select("*")
        .eq("project_id", input.projectId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch project decisions: ${error.message}`,
        });
      }

      return data as ProjectDecision[];
    }),

  // Save (upsert) a project decision
  saveProjectDecision: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        decisionId: z.string().min(1),
        selectedOption: z.string().min(1),
        note: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // First verify the user owns this project
      const { data: project, error: projectError } = await ctx.supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (projectError || !project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const { data, error } = await ctx.supabase
        .from("project_decisions")
        .upsert(
          {
            project_id: input.projectId,
            decision_id: input.decisionId,
            selected_option: input.selectedOption,
            note: input.note ?? null,
          },
          {
            onConflict: "project_id,decision_id",
          }
        )
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to save project decision: ${error.message}`,
        });
      }

      return data as ProjectDecision;
    }),

  // Delete a project decision
  deleteProjectDecision: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        decisionId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // First verify the user owns this project
      const { data: project, error: projectError } = await ctx.supabase
        .from("projects")
        .select("id")
        .eq("id", input.projectId)
        .eq("user_id", ctx.user.id)
        .single();

      if (projectError || !project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const { error } = await ctx.supabase
        .from("project_decisions")
        .delete()
        .eq("project_id", input.projectId)
        .eq("decision_id", input.decisionId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete project decision: ${error.message}`,
        });
      }

      return { success: true };
    }),

  // Streaming chat procedure using async generators (tRPC v11)
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(chatMessageSchema),
        decision: decisionContextSchema,
        project: projectContextSchema.optional(),
      })
    )
    .mutation(async function* ({ input }): AsyncGenerator<StreamChunk> {
      // Build project context section if available
      const projectSection = input.project
        ? `
Project Context:
- Project Name: ${input.project.name}${input.project.description ? `\n- Project Description: ${input.project.description}` : ""}

`
        : "";

      const systemPrompt = `You are a helpful system design assistant. You're helping a developer make decisions about their system architecture.
${projectSection}Current Decision Context:
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

Help the user understand the tradeoffs and make an informed decision based on their specific requirements. Be concise but thorough. Ask clarifying questions if needed to give better recommendations.${input.project ? ` Keep in mind the user is working on "${input.project.name}"${input.project.description ? ` which is described as: ${input.project.description}` : ""}.` : ""}`;

      for await (const chunk of getLLMProvider().streamChat(
        input.messages,
        systemPrompt
      )) {
        yield chunk;
      }
    }),

  // Streaming chat with tool support for saving decisions
  chatWithTools: protectedProcedure
    .input(
      z.object({
        messages: z.array(chatMessageSchema),
        decision: decisionContextSchema,
        project: z.object({
          id: z.number(),
          name: z.string(),
          description: z.string().nullable(),
        }),
        // Optional: pending tool results from previous tool calls
        pendingToolResults: z
          .array(
            z.object({
              tool_use_id: z.string(),
              content: z.string(),
              is_error: z.boolean().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async function* ({ input, ctx }): AsyncGenerator<StreamChunk> {
      const provider = getLLMProvider();

      // Define the save_decision tool
      const saveDecisionTool: ToolDefinition = {
        name: "save_decision",
        description: `Save the user's technical decision for this project. Use this tool when the user has clearly indicated they want to go with a specific option and would like to save/record that decision. Always ask for confirmation before using this tool. The tool will save their choice to the project "${input.project.name}".`,
        input_schema: {
          type: "object",
          properties: {
            selected_option: {
              type: "string",
              description:
                "The name of the selected option (must match one of the available options exactly)",
            },
            note: {
              type: "string",
              description:
                "Optional note explaining the reasoning behind this decision (max 2000 chars)",
            },
          },
          required: ["selected_option"],
        },
      };

      const systemPrompt = buildSystemPromptWithTools(input);

      // Check if provider supports tools
      if (!provider.streamChatWithTools) {
        // Fallback to regular streaming if tools not supported
        for await (const chunk of provider.streamChat(
          input.messages,
          systemPrompt
        )) {
          yield chunk;
        }
        return;
      }

      // Stream with tool support
      const pendingToolCalls: ToolCall[] = [];

      for await (const chunk of provider.streamChatWithTools({
        messages: input.messages,
        systemPrompt,
        tools: [saveDecisionTool],
        toolResults: input.pendingToolResults,
      })) {
        if (chunk.type === "tool_use" && chunk.toolCall) {
          // Collect tool calls to process
          pendingToolCalls.push(chunk.toolCall);
          yield chunk;
        } else if (chunk.type === "done" && pendingToolCalls.length > 0) {
          // Process tool calls before signaling done
          for (const toolCall of pendingToolCalls) {
            if (toolCall.name === "save_decision") {
              const result = await executeSaveDecision(
                ctx.supabase,
                ctx.user.id,
                input.project.id,
                input.decision.id,
                toolCall.input as { selected_option: string; note?: string }
              );

              // Yield tool result for the frontend to handle
              yield {
                type: "tool_use",
                toolCall: {
                  ...toolCall,
                  input: {
                    ...toolCall.input,
                    __result: result,
                  },
                },
              };
            }
          }
          yield { type: "done" };
        } else {
          yield chunk;
        }
      }
    }),
});

/**
 * Build the system prompt for tool-enabled chat
 */
function buildSystemPromptWithTools(input: {
  decision: {
    title: string;
    description: string;
    options: Array<{
      name: string;
      pros: string[];
      cons: string[];
      bestWhen: string;
    }>;
    questions: string[];
  };
  project: { name: string; description: string | null };
}): string {
  const optionNames = input.decision.options.map((o) => o.name).join(", ");

  return `You are a helpful system design assistant. You're helping a developer make decisions about their system architecture.

Project Context:
- Project Name: ${input.project.name}${input.project.description ? `\n- Project Description: ${input.project.description}` : ""}

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

Help the user understand the tradeoffs and make an informed decision based on their specific requirements. Be concise but thorough. Ask clarifying questions if needed to give better recommendations.

IMPORTANT: You have access to a "save_decision" tool that can save the user's technical decision to their project. Use this tool when it seems a concensus has been found.
Before using the tool, always confirm with the user that they want to save their decision. For example: "Would you like me to save this decision to your project?".
It is ok to take initiative by asking the user if they want to save their decision. 
But you must never use the tool without asking the user for confirmation first.

When using the save_decision tool:
- The "selected_option" must exactly match one of: ${optionNames}
- Optionally include a "note" summarizing the key reasons for this choice`;
}

/**
 * Execute the save_decision tool call
 */
async function executeSaveDecision(
  supabase: SupabaseClient,
  userId: string,
  projectId: number,
  decisionId: string,
  input: { selected_option: string; note?: string }
): Promise<{ success: boolean; message: string; decision?: ProjectDecision }> {
  try {
    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
      return {
        success: false,
        message: "Project not found or access denied",
      };
    }

    // Upsert the decision
    const { data, error } = await supabase
      .from("project_decisions")
      .upsert(
        {
          project_id: projectId,
          decision_id: decisionId,
          selected_option: input.selected_option,
          note: input.note ?? null,
        },
        {
          onConflict: "project_id,decision_id",
        }
      )
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: `Failed to save decision: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Decision saved! Selected "${input.selected_option}" for this project.`,
      decision: data as ProjectDecision,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export type AppRouter = typeof appRouter;

// Re-export types for consumers
export type {
  ChatMessage,
  StreamChunk,
  ToolDefinition,
  ToolCall,
  ToolResult,
} from "./llm/index.js";
export type { Project, ProjectDecision } from "./supabase.js";
export { createSupabaseClient } from "./supabase.js";
