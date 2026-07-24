import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

// Transporter SMTP compartido (Gmail con app password, ver docs/MASTER.md).
// Se crea una sola vez y se reutiliza.
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT) || 587
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASSWORD

    if (!host || !user || !pass) {
      throw new Error('Faltan variables de entorno SMTP_HOST / SMTP_USER / SMTP_PASSWORD')
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  }
  return transporter
}

const FROM = `UpgradeLab <${process.env.SMTP_USER}>`

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await getTransporter().sendMail({ from: FROM, to, subject, html })
}

// Wrapper de layout compartido para que todos los emails transaccionales
// tengan el mismo look (minimalista, blanco y negro, igual que el sitio).
function layout(title: string, bodyHtml: string): string {
  return `
  <div style="background:#f7f7f5;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="background:#171717;padding:20px 28px;">
        <span style="color:#ffffff;font-size:16px;font-weight:700;">Upgrade<span style="color:#f5c451;">Lab</span></span>
      </div>
      <div style="padding:28px;color:#1a1a1a;font-size:14px;line-height:1.6;">
        <h1 style="font-size:18px;margin:0 0 16px 0;color:#171717;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #eee;color:#999;font-size:11px;">
        UpgradeLab — este es un email transaccional automatico.
      </div>
    </div>
  </div>`
}

// Se dispara cuando una compra individual pasa a `approved` en el webhook de
// Mercado Pago (Checkout Pro).
export async function sendPurchaseApprovedEmail(params: {
  to: string
  courseTitle: string
  resourceUrl: string | null
}): Promise<void> {
  const { to, courseTitle, resourceUrl } = params
  const button = resourceUrl
    ? `<p style="margin:20px 0;"><a href="${resourceUrl}" style="background:#171717;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;display:inline-block;">Acceder al curso</a></p>`
    : `<p>Ya podés acceder desde tu <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">dashboard</a>.</p>`

  const html = layout(
    'Tu compra fue aprobada',
    `<p>Confirmamos tu pago de <strong>${courseTitle}</strong>. Ya tenés acceso completo.</p>${button}`
  )

  await sendEmail(to, `Compra aprobada: ${courseTitle}`, html)
}

// Se dispara cuando una suscripcion pasa a `active` (autorizada) en el
// webhook de Mercado Pago (Suscripciones).
export async function sendSubscriptionActiveEmail(params: { to: string }): Promise<void> {
  const { to } = params
  const html = layout(
    'Tu suscripcion esta activa',
    `<p>Tu suscripcion mensual a UpgradeLab quedo activa. Ya tenés acceso a todo el catalogo.</p>
     <p style="margin:20px 0;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/cursos" style="background:#171717;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;display:inline-block;">Ver catalogo</a></p>`
  )

  await sendEmail(to, 'Tu suscripcion a UpgradeLab esta activa', html)
}
