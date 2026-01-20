import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Project {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDecision {
  id: number;
  project_id: number;
  decision_id: string;
  selected_option: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDecisionInsert {
  project_id: number;
  decision_id: string;
  selected_option: string;
  note?: string | null;
}

export interface ProjectInsert {
  user_id: string;
  name: string;
  description?: string | null;
}

export function createSupabaseClient(accessToken?: string): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
    );
  }

  const clientOptions: Parameters<typeof createClient>[2] = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };

  if (accessToken) {
    clientOptions.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  // Using `any` for database type as we handle type assertions at query level
  // You can generate proper types with `supabase gen types typescript` for full type safety
  return createClient(supabaseUrl, supabaseKey, clientOptions);
}
