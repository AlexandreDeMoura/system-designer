import superjson from "superjson";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

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
});

export type AppRouter = typeof appRouter;

