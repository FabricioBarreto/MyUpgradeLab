import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente con service role: bypassea RLS. Solo usar server-side (webhooks,
// jobs internos), nunca en Server/Client Components ni exponer al browser.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
