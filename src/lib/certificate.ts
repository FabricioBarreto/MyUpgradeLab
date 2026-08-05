import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

// Colores de marca (mismos que se usan en las tapas de los cursos en PDF).
const GOLD = rgb(0.961, 0.769, 0.318) // #f5c451
const TEAL = rgb(0.369, 0.788, 0.761) // #5ec9c2
const DARK = rgb(0.11, 0.11, 0.12)
const GRAY = rgb(0.4, 0.4, 0.42)

function formatFecha(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
}

// Genera un certificado de finalizacion en PDF (A4 apaisado), sin
// dependencias del sistema (pdf-lib es JS puro) para que funcione en un
// entorno serverless sin necesitar weasyprint ni binarios externos.
export async function generateCertificatePdf({
  studentName,
  courseTitle,
  completedAt,
}: {
  studentName: string
  courseTitle: string
  completedAt: string
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([842, 595]) // A4 apaisado en puntos
  const { width, height } = page.getSize()

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique)

  // Borde exterior
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: TEAL,
    borderWidth: 3,
  })
  // Linea interior fina en dorado
  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: GOLD,
    borderWidth: 1,
  })

  const centerText = (text: string, y: number, font = fontRegular, size = 12, color = DARK) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color })
  }

  centerText("UPGRADELAB", height - 100, fontBold, 16, TEAL)
  centerText("Certificado de Finalizacion", height - 150, fontBold, 28, DARK)

  centerText("Este certificado se otorga a", height - 220, fontRegular, 13, GRAY)
  centerText(studentName, height - 265, fontBold, 26, DARK)

  centerText("por completar exitosamente el curso", height - 320, fontRegular, 13, GRAY)
  centerText(courseTitle, height - 355, fontBold, 20, TEAL)

  centerText(`Buenos Aires, Argentina — ${formatFecha(completedAt)}`, height - 420, fontItalic, 12, GRAY)

  centerText("upgradelab.com.ar", 70, fontRegular, 10, GRAY)

  return doc.save()
}
