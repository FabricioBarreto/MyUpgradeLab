// Links estaticos a canales de comunidad (WhatsApp/Discord) por categoria.
// Decision tomada en docs/DATABASE.md: la comunidad no se modela en base de
// datos por ahora, es solo un link externo mostrado en el dashboard.
//
// Completar con los links reales cuando existan los grupos. Una categoria
// sin link configurado simplemente no aparece en la seccion "Comunidad" del
// dashboard (no se muestran links rotos ni placeholders a los usuarios).
export const COMMUNITY_LINKS: Partial<Record<string, string>> = {
  // ajedrez: "https://chat.whatsapp.com/TU-LINK-ACA",
  // programacion_ia: "https://discord.gg/TU-LINK-ACA",
  // estudio_ia: "https://chat.whatsapp.com/TU-LINK-ACA",
  // ingles: "https://chat.whatsapp.com/TU-LINK-ACA",
  // entrevistas: "https://chat.whatsapp.com/TU-LINK-ACA",
}
