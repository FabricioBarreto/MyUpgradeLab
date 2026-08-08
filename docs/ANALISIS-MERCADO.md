# Análisis de mercado — UpgradeLab

## Veredicto general

Vas por un camino razonable en lo estructural: el modelo híbrido (compra individual + suscripción), pagos locales vía Mercado Pago y precios en pesos ajustados al poder adquisitivo argentino son decisiones correctas y alineadas con cómo se mueve el mercado de infoproductos en la región. El mercado de e-learning en Latinoamérica crece a un ritmo fuerte (proyecciones de CAGR de 17-21% hacia 2033-2034, con Argentina entre los cinco mercados más desarrollados de la región después de Brasil y México), así que el timing no es un problema. Dicho esto, la investigación deja ver dos riesgos estructurales que conviene mirar de cerca antes de invertir mucho más tiempo en contenido: la dispersión entre cinco categorías sin relación entre sí, y el hecho de que el producto hoy es básicamente una biblioteca de PDFs estáticos, un formato que la evidencia de 2026 asocia con muy baja finalización y alta cancelación.

## El problema de las cinco categorías

La tendencia dominante en 2026 para plataformas chicas e independientes es la hiper-especialización: cuanto más específica la audiencia y el problema que resolvés, mejor retención, más autoridad de marca y mayor ganancia por venta. Las plataformas generalistas escalan más rápido al principio pero exigen invertir en marketing y operación por partida doble, básicamente haciendo todo el trabajo de contenido, soporte y promoción una vez por cada nicho que tocás. Ajedrez, programación/IA, estudio con IA, inglés y entrevistas de trabajo no comparten audiencia ni canal de marketing: quien busca mejorar su inglés no es la misma persona que busca prepararse para una entrevista técnica, y el contenido para captar a cada una es distinto. Esto no significa que haya que abandonar el catálogo amplio — la suscripción con acceso a todo puede seguir funcionando como diferencial — pero sí conviene elegir una categoría como punta de lanza para el marketing inicial (probablemente programación/IA, por ser la de mayor demanda y menor saturación gratuita) y tratar al resto como expansión progresiva del catálogo, no como cinco frentes de lanzamiento simultáneos.

## Categoría por categoría

Programación e IA es la categoría con más viento a favor: la demanda de talento en IA generativa, deep learning y desarrollo crece con fuerza en 2026 según reportes de empleabilidad de la región, y todavía hay espacio para contenido en español enfocado en aplicación práctica más que en teoría.

Ajedrez es probablemente la categoría más dura de las cinco: Chess.com y Lichess (gratis, sin publicidad) dominan el espacio con cientos de lecciones, análisis con motor y comunidades enormes, y Chessable ya cubre el segmento pago de cursos estructurados. Competir de forma genérica ahí es difícil; si se mantiene la categoría, conviene un ángulo bien específico (por ejemplo, ajedrez para principiantes en español con acompañamiento, algo que ni Chess.com ni Lichess ofrecen bien) en vez de intentar ser "un curso de ajedrez más".

Inglés es la categoría de mayor riesgo de desactualización: el mercado de aprendizaje de idiomas con IA superó los 100.000 millones de dólares en 2026 y está dominado por tutores conversacionales con IA (Praktika, TalkPal, Busuu, además de Duolingo + ChatGPT combinados), que ofrecen práctica oral personalizada en tiempo real. Un PDF o recurso descargable de inglés compite en desventaja frente a eso. Si se mantiene esta categoría, tendría más sentido angostarla a algo puntual y no cubierto por esas apps (inglés para entrevistas de trabajo en tecnología, vocabulario específico de un rubro) en vez de "inglés general".

Entrevistas de trabajo es un nicho más chico pero menos saturado de producto pago dedicado: la oferta que aparece es mayormente gratuita o genérica (edX, LinkedIn Learning, cursos sueltos de Udemy), lo que deja lugar para un producto específico y bien ejecutado en español, sobre todo si se conecta con la categoría de programación/IA (entrevistas técnicas).

Estudio con IA es la categoría más nueva y con menos competencia directa identificada en la búsqueda, lo cual puede ser buena o mala señal — vale la pena validar con usuarios reales si hay demanda concreta antes de invertir mucho contenido ahí.

## El contenido estático es el mayor riesgo para la suscripción

Acá está el hallazgo más importante para el modelo de negocio: los cursos con cohortes (grupo con fecha de inicio, acompañamiento y pares) tienen tasas de finalización de 85-96%, contra 10-20% en cursos autogestionados sueltos, y hasta 3-15% en marketplaces grandes como Udemy. El micro-learning con seguimiento de progreso llega a 80-90% de finalización contra 15-20% de cursos tradicionales. Esto importa directamente para UpgradeLab porque el churn en edtech de consumo es altísimo por diseño (18-25% se pierde en los primeros 60 días, generalmente porque el usuario "se traba" en algún punto sin que la plataforma lo detecte), y una suscripción mensual vive o muere de la retención mes a mes. Vender PDFs sueltos sin ningún acompañamiento es exactamente el formato que peor retiene.

No hace falta construir cohortes en vivo desde el día uno, pero sí conviene incorporar señales de progreso: barra de avance por curso, algo simple de "continuá donde quedaste", y certificado automático al terminar (los certificados están documentados como un incentivo de finalización real, no solo un adorno). Un canal de comunidad simple (un grupo de WhatsApp o Discord por categoría, aunque sea sin moderación intensiva) ya achica bastante la brecha de retención frente a un PDF que se descarga y se olvida.

> **Nota (04/08/2026):** se implementaron el certificado y el tracking de progreso ("marcar como completado"), y despues se sacaron los dos por decision del fundador — la idea del negocio es que la persona compra el PDF y avanza a su ritmo, sin que la plataforma trackee ni certifique nada. El resto del razonamiento de esta seccion (comunidad) sigue vigente.
>
> **Nota (08/08/2026):** la afirmacion de "vender PDFs sueltos" ya no aplica al camino de suscripcion — desde esta fecha, quien accede por suscripcion lee el curso como pagina web dentro de la plataforma (`content_html`), no un PDF descargable. El cambio se hizo por otra razon (que no quede una copia del archivo una vez cancelada la suscripcion), pero de paso corta el formato "se descarga y se olvida" para ese camino. La compra individual si sigue siendo PDF, porque ahi la persona pago por poseerlo. El resto del diagnostico (falta de señales de progreso, retencion, comunidad) sigue vigente igual — pasar de PDF a HTML no resuelve por si solo el problema de finalizacion/retencion que describe esta seccion.

## Afiliados: dos programas distintos, no uno

La investigación anterior sobre comisiones asumía un solo tipo de afiliado, pero en la práctica hay dos modelos con lógicas distintas. El programa de afiliados clásico (creadores de contenido, influencers) paga comisión en efectivo de un solo lado — ahí el 30% que definimos es razonable, aunque plataformas como Hotmart pagan 40-80% porque compiten dentro de un marketplace saturado de productos por la atención del afiliado. El programa de referidos entre conocidos funciona distinto: la recompensa suele ser de dos lados (quien refiere gana algo, y el referido también recibe un descuento o beneficio), y estos programas convierten mejor que los afiliados puros porque se apoyan en confianza personal en vez de en marketing profesional. Vale la pena ofrecer ambos: comisión en efectivo del 30% para quien promociona activamente como si fuera un negocio, y un descuento del primer mes para el amigo referido además de la comisión para quien lo trajo, pensado para el uso más casual de "le paso el link a un conocido".

## El contexto de inflación argentina

Con una inflación proyectada cercana al 30% para 2026, un precio fijo en pesos pierde poder adquisitivo real mes a mes si no se ajusta. La práctica estándar documentada es actualizar precios de forma periódica (mensual o trimestral) siguiendo el IPC del INDEC o, más informalmente, el dólar blue. Conviene agregar esto como regla de negocio explícita en `MASTER.md`: revisar el precio de la suscripción y de los PDFs cada trimestre, no dejarlo fijo indefinidamente como está planteado hoy.

## Qué es interesante agregar, en orden de impacto

Lo primero es una señal de progreso y finalización por curso (barra de avance + certificado automático), porque ataca directamente el problema de retención documentado y es relativamente barato de construir con lo que ya existe en Supabase. Segundo, un canal de comunidad mínimo por categoría, aunque sea un grupo externo de WhatsApp linkeado desde el dashboard, para no depender solo del PDF. Tercero, repensar la prueba de la suscripción: en vez de pagar desde el primer mes, un trial corto (7 días es el estándar) suele convertir mejor que pedir la tarjeta de entrada sin haber probado nada. Cuarto, separar el programa de afiliados en dos ramas (comisión para promotores, descuento doble para referidos casuales). Quinto, una política de revisión trimestral de precios atada a inflación. Y sexto, un dashboard de usuario con "seguir donde quedaste" en vez de solo una lista de recursos descargables, que es lo mínimo para que la suscripción se sienta como una plataforma viva y no como una carpeta de Google Drive con más pasos.

## Fuentes

- [Latin America E-learning Market Size, Share & Growth, 2034](https://www.marketdataforecast.com/market-reports/latin-america-e-learning-market)
- [E-learning en LATAM 2025: Tendencias, Reportes, Estadisticas](https://bit4learn.com/es/lms/el-mercado-del-e-learning-global-y-en-latinoamerica/)
- [Cohort Based Learning Vs. Self Paced Learning: Key Differences in 2026](https://www.educate-me.co/blog/cohort-based-learning-vs-self-paced-learning)
- [Cohort vs Self-Paced Courses: Completion & Pricing Data (2026) - Ruzuku](https://www.ruzuku.com/learn/articles/cohort-vs-self-paced)
- [The EdTech Retention Problem: Why Learners Keep Canceling](https://loyalty.cx/edtech-retention-problem/)
- [The Complete EdTech Churn Checklist](https://www.crobenchmark.com/blog/edtech-churn-checklist)
- [General Platforms vs Niche Marketplaces 2026](https://www.yo-kart.com/blog/general-vs-niche-marketplaces-which-business-model-works-best-in-2026/)
- [Trending Course Niches People Pay For in 2026](https://uteach.io/articles/course-niches-people-pay-for)
- [10 Best Chess Courses for 2026 — Class Central](https://www.classcentral.com/report/best-chess-courses/)
- [La mejor IA para aprender idiomas en 2026](https://languatalk.com/blog/cual-es-la-mejor-ia-para-aprender-idiomas/)
- [IA para aprender idiomas gratis en 2026](https://mentoraia.com/ia-para-aprender-idiomas/)
- [Referral vs. Affiliate Program: Which Is Right for You? - ReferralRock](https://referralrock.com/blog/referral-program-vs-affiliate-programs/)
- [Affiliate vs Referral Programs: A Side-By-Side Comparison - GrowSurf](https://growsurf.com/blog/whats-the-difference-between-a-referral-program-and-affiliate-program/)
- [Hotmart Argentina 2026: Cómo registrarte](https://stefyendigital.com/hotmart-argentina-2026/)
- [A cuánto llegarán el dólar y la inflación a fines de 2026 - Infobae](https://www.infobae.com/economia/2026/07/07/a-cuanto-llegaran-el-dolar-y-la-inflacion-a-fines-de-2026-segun-los-principales-analistas-de-mercado/)
- [Free trial conversion rate: benchmarks and 12 strategies](https://www.appcues.com/blog/free-to-paid-conversion-strategies)
- [Freemium vs Free Trial: 2026 Conversion Benchmarks](https://www.ideaplan.io/compare/freemium-vs-free-trial)
