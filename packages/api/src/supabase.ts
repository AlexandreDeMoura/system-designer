import { createClient } from "@supabase/supabase-js";

// Database types for projects table
export interface Project {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  user_id: string;
  name: string;
  description?: string | null;
}

// Lazy initialization to ensure env vars are loaded first
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseClient: ReturnType<typeof createClient<any>> | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
      );
    }

    // Using `any` for database type as we handle type assertions at query level
    // You can generate proper types with `supabase gen types typescript` for full type safety
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}
