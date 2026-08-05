import Link from "next/link"

export const metadata = {
  title: "Política de Privacidad — UpgradeLab",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export default function PrivacidadPage() {
  const contactEmail = process.env.SMTP_USER ?? "contacto@upgradelab.com.ar"

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Volver al inicio
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-neutral-500">Última actualización: agosto de 2026.</p>

      <p className="mt-6 text-sm leading-relaxed text-neutral-700">
        En UpgradeLab respetamos tu privacidad y tratamos tus datos personales de acuerdo a la Ley
        25.326 de Protección de Datos Personales de la República Argentina. Esta política explica
        qué datos recopilamos, para qué los usamos y qué derechos tenés sobre ellos.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p>
          El responsable de los datos que recopila este Sitio es UpgradeLab. Podés contactarnos por
          cualquier consulta relacionada a tus datos personales escribiendo a{" "}
          <a href={`mailto:${contactEmail}`} className="font-medium text-neutral-900 hover:underline">
            {contactEmail}
          </a>
          .
        </p>
      </Section>

      <Section title="2. Qué datos recopilamos">
        <p>
          Nombre completo y email, cuando creás una cuenta. Historial de compras y estado de tu
          suscripción. Si te sumás al programa de afiliados, también tu alias o CBU de cobro. No
          recopilamos ni almacenamos datos de tarjetas de crédito/débito — eso lo procesa Mercado
          Pago directamente.
        </p>
      </Section>

      <Section title="3. Para qué usamos tus datos">
        <p>
          Para darte acceso a los cursos que compraste o a los que tu suscripción incluye, para
          procesar pagos y enviarte los emails transaccionales correspondientes (confirmación de
          compra, activación de suscripción), para responder tus consultas o sugerencias, y para
          acreditar comisiones si participás del programa de afiliados.
        </p>
      </Section>

      <Section title="4. Con quién compartimos datos">
        <p>
          Con Mercado Pago, para procesar los pagos. Con Supabase, nuestro proveedor de base de
          datos y autenticación. Con Cloudinary, donde se alojan los archivos de los cursos. Con
          nuestro proveedor de email (SMTP), para enviar los correos transaccionales. No vendemos ni
          alquilamos tus datos a terceros con fines publicitarios.
        </p>
      </Section>

      <Section title="5. Cuánto tiempo conservamos tus datos">
        <p>
          Mientras tu cuenta esté activa, y el tiempo adicional que exijan las obligaciones legales
          o impositivas aplicables (por ejemplo, registros de facturación).
        </p>
      </Section>

      <Section title="6. Tus derechos (ARCO)">
        <p>
          Como titular de tus datos, tenés derecho a acceder a ellos, rectificarlos si están
          desactualizados o son incorrectos, y solicitar su supresión cuando corresponda. También
          podés retirar el consentimiento que hayas dado. La Agencia de Acceso a la Información
          Pública, en su carácter de Órgano de Control de la Ley 25.326, tiene la atribución de
          atender denuncias y reclamos que interpongan quienes resulten afectados en sus derechos
          por incumplimiento de las normas vigentes.
        </p>
        <p>
          Para ejercer estos derechos, escribinos a{" "}
          <a href={`mailto:${contactEmail}`} className="font-medium text-neutral-900 hover:underline">
            {contactEmail}
          </a>
          .
        </p>
      </Section>

      <Section title="7. Menores de edad">
        <p>
          El Sitio no está dirigido a menores de 18 años y no recopilamos deliberadamente datos de
          menores sin la autorización correspondiente de un adulto responsable.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          Usamos cookies técnicas necesarias para el funcionamiento del Sitio (por ejemplo, mantener
          tu sesión iniciada) y una cookie para trackear links de referido del programa de
          afiliados. El detalle completo está en nuestra{" "}
          <Link href="/cookies" className="font-medium text-neutral-900 hover:underline">
            Política de Cookies
          </Link>
          .
        </p>
      </Section>

      <Section title="9. Cambios en esta política">
        <p>
          Podemos actualizar esta política en cualquier momento. Los cambios relevantes te los
          vamos a avisar por email.
        </p>
      </Section>
    </div>
  )
}
