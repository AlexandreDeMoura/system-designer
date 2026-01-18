/**
 * Module-level token store for tRPC client.
 *
 * Why: The tRPC client is created outside React's component tree (in main.tsx),
 * so it can't access React context or hooks. This store bridges React auth state
 * with the tRPC headers() function, which reads the token on each request.
 *
 * Sync: auth.tsx calls setAccessToken() whenever the Supabase session changes.
 *
 * Warning: This is duplicated state — the token also lives in AuthContext.
 * Don't use this pattern for other shared state; Might use Zustand later on instead.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}
