// Links estaticos a canales de comunidad (WhatsApp/Discord) por categoria.
// Decision tomada en docs/DATABASE.md: la comunidad no se modela en base de
// datos por ahora, es solo un link externo mostrado en el dashboard.
//
// Completar con los links reales cuando existan los grupos. Una categoria
// sin link configurado simplemente no aparece en la seccion "Comunidad" del
// dashboard (no se muestran links rotos ni placeholders a los usuarios).
//
// 08/08/2026: por ahora hay una sola Comunidad de WhatsApp ("MyUpgradeLab",
// con 1 grupo interno) que sirve a todas las categorias, no una por
// categoria — por eso el mismo link se repite en las 5. El dashboard
// deduplica por URL, asi que un suscriptor con acceso a todo el catalogo ve
// una sola tarjeta de "Unirme", no cinco repetidas. El dia que se abra un
// grupo especifico para una categoria (ver plan en TASKS.md: arrancar con
// Programacion/IA y sumar el resto despues), alcanza con cambiar esa entrada
// por el link del grupo nuevo.
const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/KtpygmmH046BgO5O8tGksB"

export const COMMUNITY_LINKS: Partial<Record<string, string>> = {
  programacion_ia: WHATSAPP_COMMUNITY,
  estudio_ia: WHATSAPP_COMMUNITY,
  ingles: WHATSAPP_COMMUNITY,
  entrevistas: WHATSAPP_COMMUNITY,
  ventas_freelance: WHATSAPP_COMMUNITY,
}
