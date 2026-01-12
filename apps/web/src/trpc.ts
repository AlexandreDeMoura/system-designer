import superjson from "superjson";
import { createTRPCReact, httpBatchStreamLink } from "@trpc/react-query";
import type { AppRouter } from "@sd/api";

export const trpc = createTRPCReact<AppRouter>();

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchStreamLink({
        url: "/trpc",
        transformer: superjson,
      }),
    ],
  });
}
