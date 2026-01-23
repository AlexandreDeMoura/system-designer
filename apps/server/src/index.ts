import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load .env from apps/server/ directory
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });
import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import type { FastifyRequest } from "fastify";
import { appRouter, createSupabaseClient, type Context } from "@sd/api";

const server = Fastify({ logger: true });

// #region agent log
server.addHook('onRequest', async (request) => {
  fetch('http://127.0.0.1:7242/ingest/79ea6f14-4549-4b16-9ec3-5051af1b2df5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.ts:onRequest',message:'Incoming request',data:{method:request.method,url:request.url,rawUrl:request.raw.url,origin:request.headers.origin,hasAuth:!!request.headers.authorization},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F,G,H'})}).catch(()=>{});
});
// #endregion

// #region agent log
server.addHook('onSend', async (request, reply, payload) => {
  const statusCode = reply.statusCode;
  if (request.method !== 'OPTIONS') {
    fetch('http://127.0.0.1:7242/ingest/79ea6f14-4549-4b16-9ec3-5051af1b2df5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.ts:onSend',message:'Response sent',data:{method:request.method,url:request.url,statusCode,payloadType:typeof payload},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F,G,H,I'})}).catch(()=>{});
  } else {
    const responseHeaders = reply.getHeaders();
    fetch('http://127.0.0.1:7242/ingest/79ea6f14-4549-4b16-9ec3-5051af1b2df5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.ts:onSend',message:'CORS preflight response',data:{allowHeaders:responseHeaders['access-control-allow-headers'],allowOrigin:responseHeaders['access-control-allow-origin'],statusCode},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
  }
  return payload;
});
// #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/79ea6f14-4549-4b16-9ec3-5051af1b2df5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.ts:createContext',message:'Auth check',data:{hasToken:true,hasUser:!!data?.user,error:error?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
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
