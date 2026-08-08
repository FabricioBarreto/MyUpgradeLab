import { createCourse } from "@/lib/actions/courses"

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nuevo curso</h1>

      {params.error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{params.error}</p>
      )}

      <form action={createCourse} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-medium text-neutral-700">Titulo</label>
          <input id="title" name="title" type="text" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label htmlFor="slug" className="text-sm font-medium text-neutral-700">Slug (URL, sin espacios)</label>
          <input id="slug" name="slug" type="text" required pattern="[a-z0-9-]+" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium text-neutral-700">Descripcion</label>
          <textarea id="description" name="description" rows={3} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-medium text-neutral-700">Categoria</label>
          <select id="category" name="category" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
            <option value="programacion_ia">Programacion / IA</option>
            <option value="estudio_ia">Estudio con IA</option>
            <option value="ingles">Ingles</option>
            <option value="entrevistas">Entrevistas de trabajo</option>
            <option value="ventas_freelance">Negocio para freelancers y devs</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="price" className="text-sm font-medium text-neutral-700">Precio (compra individual)</label>
          <input id="price" name="price" type="number" step="0.01" min="0" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label htmlFor="accessType" className="text-sm font-medium text-neutral-700">Tipo de acceso</label>
          <select id="accessType" name="accessType" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
            <option value="both">Individual + Suscripcion</option>
            <option value="individual">Solo compra individual</option>
            <option value="subscription_only">Solo suscripcion</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="resourceUrl" className="text-sm font-medium text-neutral-700">Link del recurso (Cloudinary, PDF)</label>
          <input id="resourceUrl" name="resourceUrl" type="url" className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
          <p className="text-xs text-neutral-400">Es lo que se descarga en la compra individual.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="contentHtml" className="text-sm font-medium text-neutral-700">Contenido HTML (lectura por suscripción)</label>
          <textarea id="contentHtml" name="contentHtml" rows={10} className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-xs focus:border-neutral-900 focus:outline-none" placeholder="<h2>...</h2><p>...</p>" />
          <p className="text-xs text-neutral-400">Opcional. Si lo cargás, quien accede por suscripción lee esta versión en la web en vez del PDF. Etiquetas permitidas: h1-h4, p, ul/ol/li, table, pre/code, a, strong/em.</p>
        </div>
        <button type="submit" className="w-full rounded-md bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          Crear curso
        </button>
      </form>
    </div>
  )
}
