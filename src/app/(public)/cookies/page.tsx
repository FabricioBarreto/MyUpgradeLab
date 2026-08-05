import Link from "next/link"

export const metadata = {
  title: "Política de Cookies — UpgradeLab",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Volver al inicio
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Política de Cookies</h1>
      <p className="mt-2 text-sm text-neutral-500">Última actualización: agosto de 2026.</p>

      <p className="mt-6 text-sm leading-relaxed text-neutral-700">
        Una cookie es un pequeño archivo de texto que se guarda en tu navegador cuando visitás un
        sitio web. Usamos pocas cookies, y ninguna con fines publicitarios. A continuación
        detallamos cuáles usamos y para qué.
      </p>

      <Section title="Cookies técnicas necesarias">
        <p>
          <strong>Sesión de usuario:</strong> cuando iniciás sesión, guardamos una cookie que
          identifica tu sesión (provista por nuestro proveedor de autenticación, Supabase). Sin
          esta cookie no podríamos mantenerte identificado entre una página y otra, y tendrías que
          volver a iniciar sesión en cada visita. No se puede deshabilitar sin perder la
          funcionalidad de login.
        </p>
      </Section>

      <Section title="Cookie del programa de afiliados">
        <p>
          <strong>ul_ref:</strong> cuando entrás al Sitio a través de un link de referido
          (formato <code className="rounded bg-neutral-100 px-1 py-0.5">upgradelab.com/?ref=CODIGO</code>),
          guardamos ese código en una cookie por 60 días. Sirve únicamente para saber, si te
          registrás, qué afiliado te recomendó el Sitio, y así poder acreditarle su comisión. No se
          usa para publicidad ni se comparte con terceros.
        </p>
      </Section>

      <Section title="Cómo deshabilitar cookies">
        <p>
          Podés bloquear o eliminar cookies desde la configuración de tu navegador. Tené en cuenta
          que si bloqueás la cookie de sesión, no vas a poder iniciar sesión ni acceder a los cursos
          que compraste.
        </p>
      </Section>

      <Section title="Más información">
        <p>
          Para entender qué datos recopilamos en general y con quién los compartimos, consultá
          nuestra{" "}
          <Link href="/privacidad" className="font-medium text-neutral-900 hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      </Section>
    </div>
  )
}
