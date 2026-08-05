'use server'

import { redirect } from 'next/navigation'
import { sendArrepentimientoRequestEmail } from '@/lib/email'

function generateCode(): string {
  const date = new Date()
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ARR-${stamp}-${random}`
}

// "Boton de arrepentimiento" (Disposicion 954/2025 de la Secretaria de
// Defensa del Consumidor): cualquiera puede pedir la revocacion de una
// compra sin necesidad de estar registrado ni loguearse. Generamos un
// codigo de identificacion al instante (la norma exige informarlo dentro de
// las 24hs, se lo damos de una) y avisamos por email para que se procese a
// mano — no hay reembolso automatico.
export async function submitArrepentimiento(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const name = (formData.get('name') as string)?.trim() || null
  const reference = (formData.get('reference') as string)?.trim() || null
  const message = (formData.get('message') as string)?.trim() || null

  if (!email) {
    redirect(`/reembolsos?error=${encodeURIComponent('Ingresa el email con el que compraste')}`)
  }

  const code = generateCode()

  try {
    await sendArrepentimientoRequestEmail({
      code,
      requesterEmail: email,
      requesterName: name,
      reference,
      message,
    })
  } catch (err) {
    console.error('Error enviando notificacion de arrepentimiento', err)
    redirect(`/reembolsos?error=${encodeURIComponent('No se pudo enviar el pedido, intenta de nuevo o escribinos directamente')}`)
  }

  redirect(`/reembolsos?code=${encodeURIComponent(code)}`)
}
