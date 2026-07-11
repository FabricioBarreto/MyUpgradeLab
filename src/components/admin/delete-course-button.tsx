"use client"

import { deleteCourse } from "@/lib/actions/courses"

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  return (
    <form
      action={deleteCourse}
      onSubmit={(e) => {
        if (!confirm("Seguro que queres borrar este curso? No se puede deshacer.")) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={courseId} />
      <button type="submit" className="text-sm text-red-600 hover:text-red-800 hover:underline">
        Borrar
      </button>
    </form>
  )
}
