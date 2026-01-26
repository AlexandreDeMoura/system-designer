import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load .env from apps/server/ directory
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import type { FastifyRequest } from "fastify";
import { appRouter, createSupabaseClient, type Context } from "@sd/api";

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://system-designer.com",
    "https://www.system-designer.com",
  ],
  credentials: true,
  allowedHeaders: ["authorization", "content-type", "trpc-accept"],
});

await server.register(rateLimit, {
  max: 50,
  timeWindow: "5 minutes",
});

async function createContext({
  req,
}: {
  req: FastifyRequest;
}): Promise<Context> {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

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

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

const port = Number(process.env.PORT) || 3000;

await server.listen({ port, host: "0.0.0.0" });
console.log(`Server running on port ${port}`);
