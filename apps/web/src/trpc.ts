import superjson from "superjson";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@sd/api";

export const trpc = createTRPCReact<AppRouter>();

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/trpc",
        transformer: superjson,
      }),
    ],
  });
}

