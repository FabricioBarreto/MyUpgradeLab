import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { toggleCourseActive } from "@/lib/actions/courses"
import { DeleteCourseButton } from "@/components/admin/delete-course-button"

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Cursos</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Nuevo curso
        </Link>
      </div>

      {params.error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{params.error}</p>
      )}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Titulo</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {courses?.map((course) => (
              <tr key={course.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 text-neutral-900">{course.title}</td>
                <td className="px-4 py-3 text-neutral-600">{course.category ?? "-"}</td>
                <td className="px-4 py-3 text-neutral-600">${course.price}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      course.is_active
                        ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                        : "rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500"
                    }
                  >
                    {course.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <form action={toggleCourseActive}>
                      <input type="hidden" name="id" value={course.id} />
                      <input type="hidden" name="isActive" value={String(course.is_active)} />
                      <button type="submit" className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline">
                        {course.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                    <DeleteCourseButton courseId={course.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(!courses || courses.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  No hay cursos todavia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
