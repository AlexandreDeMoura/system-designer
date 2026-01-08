import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "@sd/api";

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
});

await server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext: async () => ({}) },
});

const port = Number(process.env.PORT) || 3000;

await server.listen({ port, host: "127.0.0.1" });
console.log(`🚀 Server running at http://127.0.0.1:${port}`);

