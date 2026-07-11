# MASTER — UpgradeLab

## Idea del proyecto
Plataforma web de venta de cursos/recursos educativos (ajedrez, programación/IA, 
estudio con IA, inglés, entrevistas de trabajo). Modelo híbrido:
- Compra individual de PDFs/cursos sueltos (pago único)
- Suscripción mensual con acceso total sin descarga + contenido actualizado
- Programa de afiliados con comisión por referidos
- Panel admin para gestionar cursos, sugerencias y pagos manuales

## Nombre de marca
UpgradeLab

## Stack tecnológico
- Frontend/Backend: Next.js (App Router, TypeScript, Tailwind)
- Base de datos: Supabase (PostgreSQL + Auth)
- Almacenamiento de video/imágenes: Cloudinary
- Pagos: Mercado Pago (Checkout Pro + Suscripciones/Preapproval)
- Emails transaccionales: SMTP (Nodemailer)
- Hosting: Vercel (dominio provisorio .vercel.app)

## Cómo trabajamos
- Los archivos de contexto del proyecto viven en /docs (MASTER.md, DATABASE.md, TASKS.md)
- Toda tarea nueva se agrega primero a TASKS.md antes de implementarla
- Al terminar una tarea, se mueve de "To Do" a "Done" con fecha
- Los cambios al schema de base de datos se documentan en DATABASE.md antes de aplicarse
- Las decisiones de negocio (precios, % afiliados, reglas) se agregan a este archivo
- Convención de commits: tipo(alcance): descripción — ej. feat(auth): agregar login con Supabase
- Ante ambigüedad, se prioriza simplicidad y lo que ya soporta Supabase/Vercel de fábrica

## Reglas de negocio definidas
- Comisión de afiliados: [DEFINIR %]
- Comisión recurrente o solo primer pago: [DEFINIR]
- Precio suscripción mensual: [DEFINIR]
- Precio PDFs individuales: [DEFINIR]

## Estructura de carpetas (referencia)
Ver DATABASE.md para schema completo.
/src/app/(public), /src/app/(dashboard), /src/app/(admin), /src/app/api, /src/lib
