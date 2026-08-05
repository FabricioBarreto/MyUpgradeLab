import Link from "next/link"

export const metadata = {
  title: "Términos y Condiciones — UpgradeLab",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export default function TerminosPage() {
  const contactEmail = process.env.SMTP_USER ?? "contacto@upgradelab.com.ar"

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Volver al inicio
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Términos y Condiciones</h1>
      <p className="mt-2 text-sm text-neutral-500">Última actualización: agosto de 2026.</p>

      <p className="mt-6 text-sm leading-relaxed text-neutral-700">
        Estos Términos y Condiciones regulan el uso de UpgradeLab (el &quot;Sitio&quot;) y la compra
        de cursos y suscripciones ofrecidos a través de él. Al crear una cuenta, comprar un curso o
        contratar la suscripción, aceptás estos términos en su totalidad. Si no estás de acuerdo, no
        deberías usar el Sitio.
      </p>

      <Section title="1. Quiénes pueden contratar">
        <p>
          Para registrarte, comprar un curso o contratar la suscripción tenés que ser mayor de 18
          años y tener capacidad legal para contratar. Si sos menor de edad, necesitás la
          autorización y supervisión de un adulto responsable.
        </p>
      </Section>

      <Section title="2. Qué vendemos">
        <p>
          Vendemos acceso a material educativo en formato digital (PDF y, en el caso de la
          suscripción, visualización en línea) organizado en cursos. El acceso puede ser individual
          (pago único, por curso) o por suscripción mensual (acceso a todo el catálogo activo
          mientras la suscripción esté vigente).
        </p>
        <p>
          Los cursos comprados de forma individual quedan disponibles para descargar de forma
          permanente. El acceso por suscripción es válido únicamente mientras la suscripción esté
          activa: si la cancelás, perdés el acceso a los cursos que no hayas comprado
          individualmente.
        </p>
      </Section>

      <Section title="3. Precios y medios de pago">
        <p>
          Los precios están expresados en pesos argentinos (ARS) e incluyen los impuestos que
          correspondan. Nos reservamos el derecho de modificar los precios de cursos nuevos o
          futuros ciclos de suscripción; los cambios no afectan compras ya realizadas.
        </p>
        <p>
          Los pagos se procesan a través de Mercado Pago. UpgradeLab no almacena números de tarjeta
          ni datos sensibles de pago — esa información la maneja Mercado Pago bajo sus propios
          términos y políticas de seguridad.
        </p>
      </Section>

      <Section title="4. Suscripción mensual">
        <p>
          La suscripción se renueva automáticamente cada mes hasta que la canceles. Podés
          cancelarla en cualquier momento desde tu cuenta o desde Mercado Pago; la cancelación
          aplica al final del período ya pagado, no genera reembolso del período en curso.
        </p>
      </Section>

      <Section title="5. Licencia de uso y propiedad intelectual">
        <p>
          Todo el contenido de los cursos (textos, PDFs, ejemplos, materiales descargables) es
          propiedad de UpgradeLab o de terceros que nos autorizaron su uso, y está protegido por la
          Ley 11.723 de Propiedad Intelectual. Al comprar un curso o suscribirte, te otorgamos una
          licencia personal, intransferible y no exclusiva para uso individual.
        </p>
        <p>
          Está prohibido reproducir, distribuir, revender, compartir, subir a plataformas de
          terceros o poner a disposición pública el contenido, total o parcialmente, sin
          autorización previa por escrito. El incumplimiento puede dar lugar a la suspensión de la
          cuenta y a las acciones legales que correspondan.
        </p>
      </Section>

      <Section title="6. Certificados de finalización">
        <p>
          Al marcar un curso como completado podés descargar un certificado de finalización. Este
          certificado acredita que completaste el curso dentro de UpgradeLab: no es un título
          oficial, no tiene validez académica ni está avalado por ningún organismo educativo público
          o privado.
        </p>
      </Section>

      <Section title="7. Reembolsos y derecho de arrepentimiento">
        <p>
          Al tratarse de contenido digital de acceso o descarga inmediata, aplican excepciones
          específicas al derecho de arrepentimiento previsto en la Ley 24.240 y el Código Civil y
          Comercial. Los detalles completos, y cómo ejercer tus derechos como consumidor, están en
          nuestra{" "}
          <Link href="/reembolsos" className="font-medium text-neutral-900 hover:underline">
            Política de Reembolsos
          </Link>
          .
        </p>
      </Section>

      <Section title="8. Programa de afiliados">
        <p>
          Cualquier usuario registrado puede sumarse al programa de afiliados y obtener un link de
          referido propio. Por cada compra individual o suscripción aprobada que se genere a través
          de ese link, el afiliado gana una comisión en efectivo (30% por defecto, informada en su
          panel de afiliado) sobre el monto de la venta.
        </p>
        <p>
          El pago de comisiones acumuladas se realiza una vez al mes, el día 10 (o el primer día
          hábil siguiente), por transferencia al alias o CBU que el afiliado haya cargado en su
          perfil. Si no cargaste un alias o CBU, no vamos a poder pagarte hasta que lo hagas.
        </p>
        <p>
          No está permitido generar tráfico fraudulento, autorreferirse para simular ventas, hacer
          spam, ni pujar por publicidad usando la marca &quot;UpgradeLab&quot; sin autorización.
          Nos reservamos el derecho de suspender o dar de baja a un afiliado que incumpla estas
          condiciones, incluyendo la anulación de comisiones no pagadas que se hayan generado de
          forma fraudulenta.
        </p>
      </Section>

      <Section title="9. Cuenta de usuario">
        <p>
          Sos responsable de mantener la confidencialidad de tu contraseña y de toda actividad que
          ocurra en tu cuenta. Avisanos apenas detectes un uso no autorizado.
        </p>
      </Section>

      <Section title="10. Modificaciones">
        <p>
          Podemos actualizar estos Términos en cualquier momento. Los cambios rigen desde su
          publicación en esta página. Si el cambio es sustancial, vamos a avisarte por email.
        </p>
      </Section>

      <Section title="11. Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por las leyes de la República Argentina. Para cualquier
          controversia, las partes se someten a los tribunales ordinarios competentes, sin perjuicio
          de tu derecho como consumidor a reclamar ante los organismos de defensa del consumidor de
          tu domicilio.
        </p>
      </Section>

      <Section title="12. Contacto">
        <p>
          Para consultas sobre estos Términos, escribinos a{" "}
          <a href={`mailto:${contactEmail}`} className="font-medium text-neutral-900 hover:underline">
            {contactEmail}
          </a>
          .
        </p>
      </Section>
    </div>
  )
}
