import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-6">
          <span className="font-semibold text-neutral-900">Admin</span>
          <Link href="/admin/courses" className="text-sm text-neutral-600 hover:text-neutral-900">
            Cursos
          </Link>
          <Link href="/admin/suggestions" className="text-sm text-neutral-600 hover:text-neutral-900">
            Sugerencias
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  )
}
