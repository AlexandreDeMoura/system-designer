import superjson from "superjson";
import { createTRPCReact, httpBatchStreamLink } from "@trpc/react-query";
import type { AppRouter } from "@sd/api";
import { getAccessToken } from "./authStore";

export const trpc = createTRPCReact<AppRouter>();

function getApiUrl() {
  // Use env var in production, relative path in dev (Vite proxies to backend)
  return import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/trpc`
    : "/trpc";
}

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchStreamLink({
        url: getApiUrl(),
        transformer: superjson,
        headers() {
          const token = getAccessToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
