# TASKS — UpgradeLab

## Convencion: donde viven los archivos de los cursos
Los fuentes (HTML) y el PDF final de cada curso se guardan en `/cursos/<categoria>/<slug-del-nivel-o-curso>.html|.pdf` (28/07/2026, reorganizado desde archivos sueltos en la raiz). El PDF servido a los compradores vive en Cloudinary (carpeta `courses/`, ver `resource_url` en la tabla `courses` de Supabase) — la copia en `/cursos` es el original de referencia para editar o resubir el PDF. **Desde el 08/08/2026 este `.html` cumple un segundo rol**: es tambien la fuente de la que se deriva `courses.content_html` (lo que lee quien accede por suscripcion, ver "Lectura de cursos por suscripcion en HTML" en Done). Si se edita el contenido de un curso, conviene actualizar este `.html` fuente y regenerar ambos (el PDF para la compra individual, y el `content_html` en Supabase para la suscripcion) para que no queden desincronizados. `estudiar-con-ia-notebooklm-claude-nano-banana` es la unica excepcion: nunca tuvo un `.html` fuente guardado, solo el PDF (su `content_html` se reconstruyo extrayendo texto del PDF, no de una fuente HTML real). Estructura actual:
- `cursos/estudio-ia/estudiar-con-ia-notebooklm-claude-nano-banana.pdf`
- `cursos/programacion-ia/nivel-1-fundamentos.html` + `.pdf`
- `cursos/programacion-ia/nivel-2-flujos-de-trabajo.html` + `.pdf`
- `cursos/programacion-ia/nivel-3-proyectos-completos.html` + `.pdf`
- `cursos/ventas-freelance/venta-consultiva-discovery-calls.html` + `.pdf`
- `cursos/entrevistas/entrevistas-trabajo-developers.html` + `.pdf`
- `cursos/ventas-freelance/marketing-herramientas-gratuitas.html` + `.pdf`
- `cursos/ingles/ingles-tecnico-developers.html` + `.pdf`
- `cursos/ventas-freelance/software-medida-ia-negocios.html` + `.pdf`

## To Do
- [ ] Rama de descuento del programa de afiliados (doble beneficio para el referido casual) — depende de agregar soporte de cupon en el checkout (`coupon_code` en la preferencia de Mercado Pago). La rama de comision cash ya esta hecha, ver Done (04/08/2026).
- [ ] Dashboard "segui donde quedaste" — descartado por decision del fundador junto con el tracking de progreso en general (ver Done, 04/08/2026): la idea del negocio es que la persona avanza a su ritmo sin que la plataforma trackee nada.
- [ ] Revision trimestral de precios (proceso de negocio, no requiere codigo — ver regla en MASTER.md)
- [ ] Comision de afiliados en renovaciones de suscripcion: hoy solo se acredita una vez, cuando la suscripcion pasa a `active` por primera vez — no en cada cobro mensual recurrente, porque el webhook solo trackea el estado del preapproval (no cada pago individual del cobro recurrente). Si se quiere comision mes a mes, hay que engancharse a los eventos de pago recurrente de MP, no solo al de autorizacion inicial.
- [ ] Revisar si conviene mover el pago de comisiones de afiliados de "manual" (transferencia aparte, marcando `affiliate_referrals.status = 'paid'` a mano) a algo mas automatizado, si el volumen lo justifica.
- [ ] Revision legal profesional de `/terminos`, `/privacidad`, `/cookies` y `/reembolsos` (04/08/2026) — Claude redacto un borrador razonable basado en la normativa vigente (Ley 24.240, Codigo Civil y Comercial art. 1116, Ley 25.326, Disposicion 954/2025), pero no es abogado. Antes de promocionar fuerte la pagina conviene que un abogado lo revise, en particular la exclusion del derecho de arrepentimiento (si esta mal redactada, no protege).

## In Progress
 [x] ~~Integracion Mercado Pago (Suscripciones) — incluir periodo de prueba de 7 dias~~ — superado, ver
  Done (08/08/2026): se saco el `free_trial`, la suscripcion ya no tiene periodo de prueba. La integracion
  en si (preapproval ad-hoc, webhook, boton de suscripcion) esta completa y probada con un pago real.

## Done
- [x] Comunidad de WhatsApp confirmada como unica y general, no por categoria (14/08/2026). El link real
  (`WHATSAPP_COMMUNITY` en `src/lib/community.ts`) ya estaba cargado en las 5 categorias desde el 08/08/2026 —
  faltaba solo tildar esta tarea. Ademas, se descarta la idea (mencionada en un comentario del propio
  archivo) de abrir un grupo separado por categoria empezando por Programacion/IA: decision del fundador
  de mantener una sola comunidad general para todo el catalogo.
- [x] Verificado en produccion el flujo completo de lectura (14/08/2026): suscripcion activa lee el HTML
  en `/dashboard/leer/[slug]` sin poder descargar, y compra individual descarga el PDF correctamente via
  `/api/cursos/[slug]/leer`. Cierra la migracion del 08/08/2026 y el proxy armado el 28/07/2026.
- [x] Aprovechar el espacio vacio de la pagina lectora en pantallas grandes (09/08/2026). El fundador
  reporto que, despues del rediseño anterior, seguia quedando mucho espacio libre. Se agrego:
  - `src/components/course-sidebar.tsx`: barra lateral derecha (solo desktop, `lg:block`) con tres
    bloques — categoria/tipo de acceso del curso, CTA a la comunidad de WhatsApp de esa categoria (si
    existe), y "Segui explorando" con hasta 3 cursos a los que el usuario ya tiene acceso (mismo
    criterio que en el dashboard: todas las categorias si esta suscripto, o las de sus compras
    aprobadas si no). Si no tiene acceso a mas cursos y no esta suscripto, muestra en su lugar un CTA
    para suscribirse — usa el espacio para cross-sell/upsell, no solo relleno visual.
  - `leer/[slug]/page.tsx`: el contenedor paso de `max-w-5xl` a `max-w-7xl` y el articulo de `max-w-2xl`
    a `max-w-3xl` para acomodar las tres columnas (tabla de contenidos + articulo + barra lateral). En
    mobile/tablet la barra lateral se oculta y el bloque "Segui explorando" se muestra en su lugar,
    embebido al final del articulo (`lg:hidden` en uno, `lg:block` en el otro, para no duplicar el
    mismo contenido en desktop).
  - Verificado con `tsc --noEmit` y `npm run lint`.
- [x] Rediseño de la pagina lectora de cursos (08/08/2026), pendiente desde el pase de diseño anterior
  ("mas adelante le daria un mejor diseño, todo parece muy simple"). Se agrego:
  - `src/lib/toc.ts`: extrae los capitulos (h2) del `content_html` de un curso y les inyecta un `id` al
    propio HTML para poder hacer scroll-to-anchor. Los cursos ya vienen con h2 numerados ("01 · ...",
    "02 · ..."), asi que el label de cada capitulo sale directo del heading.
  - `src/components/chapter-nav.tsx`: tabla de contenidos fija a la izquierda en pantallas grandes (antes
    ese espacio quedaba vacio), con scroll-spy via IntersectionObserver que resalta el capitulo que se
    esta leyendo.
  - `src/components/reading-progress.tsx`: barra fina fija arriba de la pagina que se va llenando con el
    scroll — señal simple de "cuanto falta" en cursos largos.
  - `dashboard/leer/[slug]/page.tsx`: layout en dos columnas en desktop (TOC + articulo), usa el margen
    que antes quedaba vacio en pantallas grandes. En mobile la tabla de contenidos se oculta y queda igual
    que antes.
  - `globals.css`: `scroll-margin-top` en `.course-article h2` para que el anchor jump no quede tapado por
    el header sticky.
  - Si un curso no tiene ningun h2 (caso limite: `estudiar-con-ia-notebooklm-claude-nano-banana`, cuyo
    `content_html` se reconstruyo del PDF y puede no tener la misma estructura), la tabla de contenidos
    simplemente no se muestra — no rompe nada.
  - Verificado con `tsc --noEmit`, `npm run lint`, y un test manual del extractor de capitulos contra
    contenido real de un curso.
  - Ajuste post-entrega (08/08/2026): primero se probo solo agregar el logo junto al link "Volver al
    dashboard", manteniendo la pagina fuera de `(with-nav)` (pensada como lectura "sin distracciones"). El
    fundador prefirio el navbar completo, asi que se movio `leer/[slug]/page.tsx` adentro de `(with-nav)`
    (la URL no cambia, las carpetas entre parentesis no afectan la ruta) para que comparta el header de
    siempre (logo, menu, email, cerrar sesion). Se saco el header propio con logo duplicado/sticky de la
    pagina (quedaba pisando al de `(with-nav)`, ambos con `position: sticky; top: 0`) y se dejo solo un
    link simple "Volver al dashboard" arriba del articulo, mismo patron que en `cursos/[slug]/page.tsx`.
    `ReadingProgress` paso a `z-30` para quedar por encima del header del layout.
- [x] Eventos de conversion en GA4: begin_checkout / purchase / subscribe (08/08/2026). Hasta ahora
  GA4 solo medía vistas de página — sin esto, al arrancar a promocionar no se iba a poder saber qué
  canal realmente convierte. Se agrego:
  - `src/lib/gtag.ts`: helper `trackEvent(name, params)` que llama a `window.gtag` si esta cargado
    (no rompe nada si falta `NEXT_PUBLIC_GA_ID`).
  - `src/components/tracked-submit-button.tsx`: wrapper cliente para el boton de submit dentro de
    los `<form action={serverAction}>` de compra/suscripcion (son Server Components, no pueden tener
    onClick directo) — dispara `begin_checkout` en el click y deja que el submit siga normal. Usado en
    el boton "Comprar" de `cursos/[slug]/page.tsx` y en "Suscribirme"/"Suscribirme de nuevo" del
    dashboard.
  - `src/components/track-conversion.tsx`: dispara un evento una sola vez al montar (useEffect + ref),
    pensado para la pagina de confirmacion.
  - `checkout.ts`: la `back_urls.success` de Checkout Pro ahora lleva `?type=curso&id=&title=&amount=`
    para poder armar el evento `purchase` sin volver a consultar la base.
  - `subscribe.ts`: el `back_url` del Preapproval (antes iba directo a `/dashboard`) ahora apunta a
    `/checkout/success?type=suscripcion` — Preapproval no tiene back_urls separadas por resultado como
    Preference, asi que se reusa la misma pagina de exito.
  - `checkout/success/page.tsx`: pasa a ser un Server Component que lee `searchParams` y renderiza uno
    de dos mensajes (compra vs suscripcion), montando `<TrackConversion>` con el evento correspondiente.
  - Nota de confiabilidad: para compra individual, llegar a `/checkout/success` ya implica pago
    aprobado (Checkout Pro usa `auto_return: 'approved'`), asi que el evento es confiable. Para
    suscripcion no hay esa garantia tan estricta (Preapproval no distingue back_url por resultado), asi
    que se cuenta como conversion por llegar a esa pantalla — el webhook sigue siendo la unica fuente de
    verdad para dar acceso real, esto es solo para medir marketing.
  - Verificado con `tsc --noEmit` y `npm run lint`, ambos limpios.
- [x] Pase de diseño: hero, tarjetas y confianza en el pago (08/08/2026):
  - Hero de la home: antes era solo texto centrado sobre blanco. Se agregaron manchas de color
    suaves de fondo (mismos tonos que el logo) y la marca en chevron como watermark grande — sin
    depender de una ilustracion nueva que quede desactualizada.
  - Tarjetas de curso en `/cursos` y en el dashboard: badge de categoria en color (reusando
    `categoryBadgeClass`, antes solo en el dashboard, ahora tambien en el catalogo publico),
    sombra y efecto de elevacion al pasar el mouse, separador antes del precio.
  - `src/components/payment-badge.tsx`: sello chico "Pago 100% seguro, procesado por Mercado
    Pago" con icono de candado, agregado debajo de los tres botones de pago (compra individual en
    `/cursos/[slug]`, suscribirme y suscribirme de nuevo en el dashboard).
- [x] Logo integrado en el sitio (08/08/2026): favicon regenerado desde `logo-upgradelab.svg` (antes era
  el icono default de Next.js) y el icono agregado junto al wordmark de texto en el header, tanto publico
  (`(public)/layout.tsx`) como del dashboard (`(dashboard)/dashboard/(with-nav)/layout.tsx`). Hasta ahora
  el logo solo se usaba en la Comunidad de WhatsApp, no en el sitio.
- [x] Comunidad de WhatsApp cargada (08/08/2026): se creó "MyUpgradeLab" (Comunidad de WhatsApp, con
  logo propio — ver `public/logo-upgradelab.png`/`.svg`, marca en el verde azulado de las tapas de los
  cursos) y se cargó el link en `src/lib/community.ts`, repetido en las 5 categorías porque hoy es una
  sola comunidad para todo el catálogo, no una por categoría. El dashboard se actualizó para deduplicar
  por URL (`communityEntries` en vez de `communityCategories`) — sin esto, un suscriptor con acceso a
  todo el catálogo iba a ver la misma tarjeta de "Unirme" repetida cinco veces. Cuando se abra un grupo
  específico por categoría (empezando por Programación/IA, ver la nota en `community.ts`), alcanza con
  cambiar esa entrada individual.
- [x] Programación/IA como punta de lanza en el homepage (08/08/2026): seccion propia destacada
  (fondo oscuro, badge "Recomendado para empezar") entre el hero y el resto de las categorias, que
  antes se mostraban todas igual de prominentes. Decision tomada en `docs/ANALISIS-MERCADO.md`
  (mayor demanda, ya tiene 3 niveles armados). El resto del catalogo sigue accesible debajo, sin
  quitar categorias, solo bajandoles jerarquia visual.
- [x] SEO/previews sociales y analytics (08/08/2026):
  - `generateMetadata` en `cursos/[slug]/page.tsx`: titulo, descripcion e imagen (si el curso tiene
    `cover_image_url`) por curso, en vez de la preview generica de "UpgradeLab" para todos los links.
    `metadataBase` agregado en `layout.tsx` (via `getAppUrl()`) para que las URLs de Open Graph salgan
    absolutas — sin esto WhatsApp/LinkedIn arman mal la preview.
  - `src/components/analytics.tsx`: Google Analytics (GA4) y Meta Pixel, cada uno se activa solo si esta
    cargada la env var correspondiente (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`) — no hace falta
    tocar codigo para prenderlos, alcanza con cargarlas en Vercel y redeployar. **Pendiente del usuario**:
    crear la propiedad GA4 / el pixel de Meta y pasar los IDs.
  - Nota de cumplimiento: no hay banner de consentimiento antes de cargar estos scripts (se cargan
    directo si la env var esta puesta). Practica comun en Argentina, pero si se quiere ser mas estricto
    con Ley 25.326 despues, lo prolijo seria no montar `<Analytics />` hasta que la persona acepte.
- [x] Precios vueltos a la normalidad (08/08/2026): `SUBSCRIPTION_PRICE` en `constants.ts` de 200 a 7999.
  El precio del curso de prueba (`programar-con-ia-nivel-1-fundamentos`) ya estaba en 4000 (revertido por
  el usuario directamente en la base). Prueba de pago real de punta a punta completada — quedo cerrado.
- [x] Lectura de cursos por suscripcion en HTML en vez de PDF (08/08/2026). Se agrego `courses.content_html`
  (texto, nullable) y se reescribio `dashboard/leer/[slug]` para que, si el curso tiene `content_html`
  cargado, la persona lo lea como articulo dentro de la propia UI (sin boton de descarga, con marca de
  agua de su email, y con `right-click` bloqueado en el area de lectura como deterrente liviano) en vez
  del PDF embebido de antes. La compra individual sigue siendo PDF descargable como siempre
  (`/api/cursos/[slug]/leer`), eso no cambio — ver "Formato de los cursos" en MASTER.md para la regla de
  negocio completa. Se armo el panel admin para cargar/editar el HTML (`/admin/courses/new` y la pagina
  nueva `/admin/courses/[id]/edit`, que no existia hasta ahora), sanitizado con `sanitize-html` antes de
  guardar (`src/lib/sanitize.ts`).

  Los 9 cursos existentes se migraron en dos pasadas: primero se probo extrayendo texto de los PDFs con
  un script en Python (pdfplumber, clasificando por tamaño/negrita de fuente) porque parecia que no habia
  otra fuente — pero despues se encontro que 8 de los 9 cursos sí tenían su `.html` original guardado en
  `/cursos` (el mismo que se usa para generar el PDF, ver la convencion al principio de este archivo), que
  da un resultado mucho mas fiel (tablas, listas numeradas, definiciones, todo con su semantica real en
  vez de reconstruida a partir del layout del PDF). Se reconvirtieron esos 8 desde su `.html` fuente con
  un segundo script (BeautifulSoup) y se resubieron. Solo `estudiar-con-ia-notebooklm-claude-nano-banana`
  quedo con la version extraida del PDF, porque nunca tuvo un `.html` fuente guardado.

  Estado final: columna creada en Supabase, los 9 cursos tienen `content_html` cargado (verificado por
  API). Falta probar la lectura en produccion con una cuenta con suscripcion activa, una vez deployado
  (ver In Progress).
- [x] Se saco el trial gratuito de 7 dias de la suscripcion (08/08/2026). El usuario probo un pago real de
  suscripcion y penso que no habia llegado a Mercado Pago; la causa real era que `.env.local` (archivo
  viejo, no es el que usa produccion) todavia tenia credenciales `TEST-`, mientras que `.env` (el vigente)
  ya tenia credenciales `APP_USR-` de produccion en ambas apps (Checkout y Suscripciones) — el pago de
  hecho funciono, la confusion fue de diagnostico. Ademas, con `free_trial` activo el primer cobro real no
  sale hasta que termina el periodo de prueba (MP solo crea una autorizacion, no un pago), lo que sumaba
  confusion a la hora de verificar. Se saco `FREE_TRIAL_DAYS` de `subscribe.ts`: ahora el `Preapproval` se
  crea sin `free_trial`, el cobro sale desde el primer dia. Actualizado tambien el texto del dashboard y
  `MASTER.md`.
- [x] Se saco tambien el tracking de progreso / "Marcar como completado" (04/08/2026). Despues de sacar el certificado, el usuario pidio sacar esto tambien: la idea del negocio es que la persona descarga el PDF y avanza a su ritmo, sin que la plataforma trackee si lo termino o no. Se elimino:
  - `src/lib/actions/progress.ts` (la accion `markCourseCompleted`) — borrado entero.
  - El componente `CourseActionButton` y sus dos usos en `/dashboard` (mostraban "Marcar completado" / "Completado ✓") — los botones de Leer/Descargar quedan solos.
  - La query a `course_progress` en `/dashboard`.
  - La tabla `course_progress` completa (definicion + policies) sacada de `docs/schema.sql`, y anotada como eliminada en `docs/DATABASE.md`.
  - **Requiere SQL manual** para borrarla de la base real (ya no la usa nada, incluye el `certificate_url` que habia quedado sin uso):
    ```sql
    drop table if exists public.course_progress;
    ```
- [x] Se saco la funcionalidad de certificado (04/08/2026). El usuario pidio removerlo por completo: le genero incomodidad y lo sintio contraproducente (una plataforma sin trayectoria emitiendo "certificados" puede sentirse como sobre-prometer, mas alla de que legalmente estaba cubierto con el disclaimer). Mi recomendacion coincidio: no es un diferencial fuerte para lo que se vende (contenido practico, no un papel), asi que mejor sacarlo que mantener algo que incomoda al fundador. Se elimino:
  - `src/lib/certificate.ts` (generador con pdf-lib) y `src/app/api/cursos/[slug]/certificado/route.ts` (la ruta que lo servia) — borrados.
  - Dependencia `pdf-lib` desinstalada de `package.json` (ya no la usa nada mas).
  - Boton/link "Certificado" en `/dashboard` reemplazado por un badge simple "Completado ✓" (se mantiene "Marcar como completado" — el progreso en si no genera ninguna incomodidad, solo se saco la emision de un documento).
  - Seccion "Certificados de finalizacion" removida de `/terminos` (secciones renumeradas).
  - `docs/DATABASE.md` y `docs/ANALISIS-MERCADO.md` anotados para reflejar la reversión (la columna `course_progress.certificate_url` queda sin uso, no se elimino de la base porque no genera ningun problema dejarla).
- [x] Aclaracion legal impresa en el propio PDF del certificado (04/08/2026). El usuario pregunto que validez legal tiene el "Certificado de Finalizacion" y si hay riesgo legal. El disclaimer ya existia en `/terminos` ("no es un titulo oficial, no tiene validez academica"), pero el PDF viaja solo una vez descargado o compartido (ej. LinkedIn) — si la persona nunca leyo los terminos del sitio, el aviso no llega con el archivo. Se agrego el mismo disclaimer, en letra chica, directamente en el pie del PDF (`src/lib/certificate.ts`), verificado renderizando un certificado de prueba a imagen.
- [x] Fix: header publico no reconocia sesion activa (04/08/2026). El usuario mando una captura desde `/cursos/[slug]` estando logueado (se veia "Ya tenes acceso a este curso" en la pagina) pero el header seguia mostrando "Ingresar"/"Registrarse" — el layout publico (`src/app/(public)/layout.tsx`) era estatico, no chequeaba sesion. Ahora es async, consulta `getUser()`, y muestra "Dashboard" + "Cerrar sesion" en vez de "Ingresar"/"Registrarse" cuando hay sesion activa. De paso se le aplico el mismo patron responsive del header del dashboard (nav completo en desktop, menu `<details>` en mobile) para que quede consistente en todo el sitio, publico y logueado.
- [x] Rediseño visual del dashboard + header/nav responsive (04/08/2026). El usuario mostro una captura senalando que el dashboard se veia desordenado y sin ningun header/nav para moverse por el sitio una vez logueado (antes solo se podia navegar escribiendo URLs a mano o con el boton atras). Cambios:
  - Nuevo `src/app/(dashboard)/dashboard/(with-nav)/layout.tsx`: header sticky con logo, nav (Dashboard / Catalogo / Afiliados / Sugerencias), email + Cerrar sesion a la derecha. En mobile colapsa a un menu hamburguesa hecho con `<details>/<summary>` nativo (sin JS, se mantiene todo como Server Component). El signOut se movio del final de la pagina al header.
  - `/dashboard` y `/dashboard/afiliados` se movieron dentro de ese grupo de rutas `(with-nav)` (route group de Next.js, no cambia la URL) para heredar el header. `/dashboard/leer/[slug]` (el lector de PDF a pantalla completa) queda afuera a proposito — no le sirve el header, necesita todo el alto de pantalla.
  - `/dashboard` rediseñado: cursos y compras ahora se muestran en grillas responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) en vez de una lista angosta de una columna, con tarjetas que tienen badge de categoria con color por rubro (`categoryBadgeClass` en `src/lib/format.ts`), badges de estado consistentes, y los botones de accion (Leer/Descargar/Marcar completado/Certificado) ahora son botones visibles en vez de texto subrayado. Saludo personalizado ("Hola, {nombre}") usando `profiles.full_name` si existe.
  - `/dashboard/afiliados` alineado al mismo estilo visual (tarjetas `rounded-xl`, mismo espaciado).
- [x] Comision de afiliados subida de 30% a 40% (04/08/2026). Cambiado el default de `affiliates.commission_rate` en `docs/schema.sql` (afecta afiliados nuevos) y todo el copy hardcodeado que mencionaba "30%": landing `/afiliados`, dashboard, pantalla de alta en `/dashboard/afiliados`, `/terminos` y docs internos (`MASTER.md`, `DATABASE.md`). Los lugares que ya leian `commission_rate` dinamicamente desde la base (webhook que calcula la comision, panel admin, panel del afiliado ya dado de alta) no necesitaron cambios de codigo — solo hace falta actualizar el dato. **Requiere SQL manual** para que aplique a los afiliados que ya existen (el cambio de default de la columna solo afecta altas nuevas):
  ```sql
  alter table public.affiliates alter column commission_rate set default 40;
  update public.affiliates set commission_rate = 40;
  ```
  Nota: esto no toca `affiliate_referrals` ya generados — las comisiones de ventas pasadas quedan calculadas con el % que regia en ese momento, como corresponde (no se recalculan retroactivamente).
- [x] `/afiliados`: gate explicito de Iniciar sesion / Registrarme en vez de un boton que decidia solo segun la sesion existente (04/08/2026). El usuario probo la pagina estando ya logueado y vio "Ir a mi panel de afiliado" en vez de una pantalla de login/registro — pidio que sea explicito. Cambiado:
  - `/afiliados` ahora siempre muestra dos botones claros: "Iniciar sesion" y "Registrarme como afiliado". Si hay sesion activa, se agrega ademas un atajo chico ("ir directo a tu panel") para no obligar a loguearse de nuevo.
  - Se agrego soporte de `redirect` en el login (`signIn` en `src/lib/actions/auth.ts` + campo oculto en `/login`): si entraste por "Iniciar sesion" desde `/afiliados`, despues de loguearte caes directo en `/dashboard/afiliados` en vez del dashboard generico. El link "Registrate" dentro de `/login` tambien respeta el contexto (te manda a `/register?intent=affiliate` si el redirect era al panel de afiliados).
- [x] Fix: doble barra en links generados con NEXT_PUBLIC_APP_URL (04/08/2026). El usuario mando una captura de `/dashboard/afiliados` en produccion mostrando el link de referido como `https://my-upgrade-lab.vercel.app//?ref=CODIGO` (doble barra). Causa: en Vercel la variable quedo cargada con barra final (`.../`), y varios lugares hacian `${appUrl}/algo` asumiendo que no la tenia. Se agrego `getAppUrl()` en `src/lib/constants.ts` que siempre saca la barra final, sin importar como este cargada la variable, y se reemplazo el uso directo de `process.env.NEXT_PUBLIC_APP_URL` en `subscribe.ts`, `checkout.ts`, `email.ts` y `dashboard/afiliados/page.tsx`. El resto de la pantalla (link, codigo, alias/CBU, pendiente/pagado, referidos) ya estaba funcionando bien — no era un tema de sesion.
- [x] Pagina publica `/afiliados` + alta directa como afiliado (04/08/2026). El usuario pidio que alguien pueda darse de alta con email/contraseña y ver su propio panel (link, cuanto acumulo, cuando cobra) sin depender de ser primero estudiante. Esto ya funcionaba en el fondo (el login de afiliado es el mismo Supabase Auth de siempre), pero no habia forma de descubrirlo sin ser usuario ya registrado. Se agrego:
  - `/afiliados`: landing publica (sin login) que explica el programa en 3 pasos y linkea a Terminos. El boton cambia solo segun si ya tenes sesion o no.
  - `/register?intent=affiliate`: mismo formulario de registro de siempre, pero si viene con este intent, el titulo/boton cambian ("Registrate como afiliado") y, apenas se crea la cuenta, se da de alta como afiliado automaticamente y se manda directo a `/dashboard/afiliados` (en vez de al dashboard de estudiante) — no hace falta el paso extra de tocar "Quiero ser afiliado".
  - Nav y footer publicos: el link "Afiliados" ahora apunta a `/afiliados` (antes apuntaba a `/dashboard/afiliados`, que redirige a login sin contexto si todavia no tenes cuenta).
- [x] Registro de primer acceso a compras, para resolver pedidos de arrepentimiento con prueba objetiva (04/08/2026). El usuario pregunto como evitar quedar expuesto a reembolsar una compra cuando la persona ya se quedo con el PDF. La excepcion del art. 1116 CCyC ya cubre esto legalmente (no hay que sacar el boton de arrepentimiento, solo se puede rechazar el pedido si ya accedio), pero faltaba una forma de probarlo sin que sea "tu palabra contra la mia". Se agrego `purchases.first_accessed_at`: `/api/cursos/[slug]/leer` lo setea la primera vez (y solo la primera) que se sirve el PDF de una compra individual. `/reembolsos` actualizado para explicar que los pedidos se resuelven mirando ese registro. Requiere SQL manual: `alter table public.purchases add column first_accessed_at timestamptz;`
- [x] Paginas legales + boton de arrepentimiento + aviso previo a la compra (04/08/2026):
  - `/terminos`, `/privacidad`, `/cookies`, `/reembolsos` — paginas publicas con el contenido completo (edad minima, licencia de uso/copyright, medios de pago via Mercado Pago, suscripcion, certificados no oficiales, terminos del programa de afiliados, datos que recopilamos y con quien los compartimos, derechos ARCO, que cookies usamos y para que).
  - `/reembolsos` incluye el "Boton de Arrepentimiento" que exige la Disposicion 954/2025 (vigente desde 11/2025, unifico y reemplazo a la vieja Resolucion 424/2020): formulario publico, sin necesidad de cuenta ni login, que genera un codigo de identificacion al instante y manda un email al admin (`src/lib/actions/legal.ts`, `sendArrepentimientoRequestEmail` en `src/lib/email.ts`). No hay reembolso automatico, se resuelve a mano.
  - Aviso previo expreso antes de comprar: checkbox obligatorio en el boton "Comprar" (`/cursos/[slug]`) y en los botones de suscribirse (dashboard) que dice que al acceder al contenido se pierde el derecho de arrepentimiento (art. 1116 CCyC) y linkea a Terminos y Reembolsos — esto es lo que la excepcion del art. 1116 exige para poder aplicarse (avisar antes, no despues).
  - Footer publico actualizado con links a las 4 paginas + al programa de afiliados.
  - **Importante**: este es un borrador razonable, no una revision legal profesional — ver nota en To Do.
- [x] Pago mensual de afiliados: alias/CBU + panel admin (04/08/2026). El usuario propuso pagar la comision acumulada una vez al mes (dia 10) por transferencia, en vez de por cada venta — es una buena practica estandar en programas de afiliados (simplifica la contabilidad y evita transferencias sueltas por montos chicos). Implementado:
  - `affiliates.payout_alias` (alias/CBU cargado por el propio afiliado) y `affiliate_referrals.paid_at` (fecha en que se pago, para tener historial) — nuevas columnas, mas la policy `affiliates_update_own` que faltaba (antes un afiliado no podia editar su propia fila).
  - `/dashboard/afiliados`: formulario para cargar/editar el alias o CBU, con aviso si todavia no lo cargo.
  - `/admin/afiliados`: lista de afiliados con su alias/CBU, total pendiente y ya pagado, y un boton "Marcar como pagado" que pasa a `paid` todas las comisiones pendientes de ese afiliado de una — pensado para usar el dia 10 de cada mes despues de hacer las transferencias reales a mano.
  - **Requiere SQL manual** (correr junto con lo de mas abajo si todavia no lo hiciste):
    ```sql
    alter table public.affiliates add column payout_alias text;
    alter table public.affiliate_referrals add column paid_at timestamptz;
    create policy affiliates_update_own on public.affiliates
      for update using (auth.uid() = user_id);
    ```
- [x] Sistema de afiliados — rama de comision cash (04/08/2026). Programa completo de referidos con comision en efectivo (30% por defecto, `affiliates.commission_rate`):
  - `middleware.ts`: si alguien entra con `?ref=CODE`, se guarda en la cookie `ul_ref` (60 dias, no pisa una cookie ya existente — gana el primer link clickeado).
  - `src/lib/actions/auth.ts` (`signUp`): al registrarse, si hay cookie `ul_ref` y el codigo corresponde a un afiliado `approved` (y no es la propia persona), se guarda `profiles.referred_by_affiliate_id` usando el service role (funciona aunque "Confirm email" este activado y todavia no haya sesion).
  - `src/lib/actions/affiliates.ts` (`becomeAffiliate`): cualquier usuario logueado puede darse de alta como afiliado — genera un codigo random de 6 caracteres (sin 0/O/1/I para que sea facil de dictar/escribir) y queda `approved` automaticamente (sin revision manual en esta v1, ya que el pago de comisiones es un proceso aparte y no hay riesgo en solo emitir un codigo).
  - `src/app/(dashboard)/dashboard/afiliados/page.tsx`: pantalla para sumarse al programa, ver el link propio (`{APP_URL}/?ref=CODIGO}`), y ver el listado de referidos con su comision y estado (pendiente/pagada).
  - Webhook de Mercado Pago (`src/app/api/webhooks/mercadopago/route.ts`, funcion `creditAffiliateCommission`): en la misma transicion donde ya se manda el email transaccional (compra recien `approved`, suscripcion recien `active`), si el comprador tiene `referred_by_affiliate_id`, se inserta una fila en `affiliate_referrals` con `commission_amount = monto * commission_rate / 100` y `status: 'pending'`. Chequea que no exista ya una fila con ese `source_id` antes de insertar, para que un reintento de webhook de MP no duplique la comision.
  - Precio de la suscripcion movido a `src/lib/constants.ts` (`SUBSCRIPTION_PRICE`) porque un archivo `'use server'` (`subscribe.ts`) solo puede exportar funciones async, y tanto `subscribe.ts` como el webhook necesitaban la constante.
  - **Requiere SQL manual** (mismo motivo de siempre: solo tengo acceso via PostgREST, no conexion directa a Postgres) — correr en el SQL Editor de Supabase antes de que esto funcione en produccion:
    ```sql
    alter table public.profiles
      add column referred_by_affiliate_id uuid references public.affiliates(id) on delete set null;
    ```
  - El pago real de la comision (transferencia al afiliado) sigue siendo manual — marcar `affiliate_referrals.status = 'paid'` a mano en Supabase una vez pagado. No hay panel admin para esto todavia (se puede agregar si el volumen lo justifica).
  - La rama de descuento para el referido casual queda pendiente, ver To Do (depende de soporte de cupon en el checkout).
- [x] Progreso y certificado por curso (04/08/2026). Usa la tabla `course_progress` ya existente en el schema:
  - `src/lib/actions/progress.ts` (`markCourseCompleted`): marca un curso como completado para el usuario actual, verificando primero que tenga acceso real (compra aprobada o suscripcion activa) antes de permitirlo.
  - `src/lib/certificate.ts` (`generateCertificatePdf`): genera el PDF del certificado con `pdf-lib` (nueva dependencia) en vez de weasyprint — a diferencia de los PDFs de los cursos (que genero yo una sola vez, offline, y subo a Cloudinary), el certificado se arma dinamicamente por request dentro del server de Next.js, y weasyprint necesita binarios del sistema (Pango/Cairo) que no son viables en un entorno serverless. `pdf-lib` es JS puro, sin dependencias nativas.
  - `src/app/api/cursos/[slug]/certificado/route.ts`: genera y devuelve el PDF al vuelo, solo si existe `course_progress.completed_at` para ese usuario y ese curso (no depende de tener acceso vigente en ese momento — una vez completado, el certificado es tuyo aunque canceles la suscripcion despues).
  - Dashboard actualizado: cada curso con acceso (comprado o por suscripcion) muestra "Marcar completado" o, si ya esta completado, un link "Certificado" para descargarlo.
  - Verificado generando un certificado de prueba con Node y renderizandolo a imagen con `pypdfium2` para confirmar que el layout se ve bien (borde, tipografia, colores de marca) antes de darlo por terminado.
- [x] Formulario de sugerencias (04/08/2026) — el lado admin (`/admin/suggestions` + `markSuggestionReviewed`) ya existia de una sesion anterior; faltaba el lado publico. Agregado `createSuggestion` en `src/lib/actions/suggestions.ts` (inserta en `suggestions`, funciona con o sin sesion — la tabla ya permite insert anonimo por RLS) y la pagina `src/app/(public)/sugerencias/page.tsx` con el formulario (nombre y email opcionales, mensaje obligatorio). Link agregado en el nav publico y en el dashboard.
- [x] Fix: pagina de curso individual no reconocia acceso ya comprado (04/08/2026) — `src/app/(public)/cursos/[slug]/page.tsx` ahora chequea compra aprobada / suscripcion activa (mismo criterio que el dashboard y el proxy de lectura) antes de decidir que mostrar: si ya tiene acceso, ofrece "Leer" (suscripcion) o "Descargar" (compra) en vez de "Comprar" de nuevo. De paso se corrigio el mensaje para cursos `subscription_only` sin acceso: ya no dice "la suscripcion todavia no esta habilitada" (desactualizado, la suscripcion ya funciona), ahora invita a suscribirse.
- [x] Curso "Software a Medida con IA para Negocios Locales" (04/08/2026) — tercer curso de la familia "Negocio para freelancers y devs" (categoria `ventas_freelance`), pensado como pieza que conecta las series Programar con IA (construir) y Venta Consultiva (vender) en un caso de negocio real. Idea original del usuario, inspirada en un modelo de negocio de construir software a medida para negocios locales (ej. un taller mecanico) usando IA. Contenido: elegir un nicho de negocio local, diagnosticar el problema real de un taller mecanico como caso hilo conductor (usando las mismas preguntas SPIN de Venta Consultiva), construir una solucion minima con herramientas de IA gratuitas (mismas de Programar con IA Nivel 1), mostrar la demo en una discovery call, como cobrar (pago unico vs. mensualidad de mantenimiento), y como replicar el metodo en otros rubros (peluquerias, gimnasios, estudios contables, kioscos). 10 paginas, subido a Cloudinary como `authenticated` (`courses/software-medida-ia-negocios.pdf`) y cargado en Supabase. $6.500 ARS, access_type `both`.
  - Nota: durante la escritura del contenido aparecio una corrupcion de encoding en un parrafo (caracteres CJK/mojibake en vez de tildes) — se detecto con un grep antes de generar el PDF y se corrigio a mano reescribiendo el parrafo sin tildes especiales, para evitar que se colara un error asi en un PDF que se vende.
- [x] Curso "Inglés Técnico para Developers" (04/08/2026) — categoria `ingles` (ya existia en el schema original, sin ALTER necesario). Validado antes de escribirlo: sueldos remotos en dolares para developers arrancan ~USD 1.000-2.000 junior y superan largamente eso en semi-senior/senior, y el ingles tecnico aparece consistentemente como el paso clave para acceder a esos roles — señal de disposicion a pagar mucho mas fuerte que el ingles generico (que ademas esta saturado de opciones gratis). Se diferencia enfocandose 100% en el ingles que un developer usa de verdad, no gramatica general. Contenido: por que el ingles tecnico multiplica ingresos, vocabulario y frases para dar/recibir feedback en code review, estructura de un buen PR en ingles (what changed / why / how to test it), frases para daily standups, preguntas tipicas de entrevista tecnica en ingles, errores comunes de hispanohablantes (falsos amigos, traduccion literal), y como usar IA como companera de practica. 10 paginas, subido a Cloudinary como `authenticated` (`courses/ingles-tecnico-developers.pdf`) y cargado en Supabase. $5.500 ARS, access_type `both`.
- [x] Curso "Posicioná tu Negocio con Herramientas Gratuitas" (04/08/2026) — segundo curso de la familia "Negocio para freelancers y devs" (categoria `ventas_freelance`, ya existia). Idea del usuario, pensada como continuacion natural de Venta Consultiva ("de nada sirve saber vender si nadie te encuentra"). Contenido: panorama de herramientas gratuitas de 2026 investigado por Claude (Canva AI / Freepik AI / Bing Image Creator para imagenes, CapCut para video corto, Metricool para programar publicaciones), identidad visual minima sin disenador, como escribir prompts de imagen especificos, estructura de video corto (gancho/desarrollo/cierre), calendario de contenido con reciclado de una idea en varios formatos, frecuencia realista (4-5 posts/semana, consistencia sobre volumen), y como programar todo en batch en vez de improvisar cada dia. 10 paginas, subido a Cloudinary como `authenticated` (`courses/marketing-herramientas-gratuitas.pdf`) y cargado en Supabase. $5.000 ARS, access_type `both`.
- [x] Curso "Entrevistas de Trabajo para Developers" (04/08/2026) — categoria `entrevistas` (ya existia en el schema original, sin ALTER necesario). Contenido: por que el proceso de entrevista va mas alla de resolver algoritmos, los 4 formatos que te podes encontrar (live coding, take-home, system design, comportamiento) y como prepararte para cada uno, metodo STAR con banco de 6-12 historias, como hablar de proyectos en terminos de problema resuelto en vez de lista de tecnologias, temas tecnicos frecuentes en 2026 (mas alla de LeetCode), negociacion salarial (investigar rango de mercado, no anclar bajo, negociar el paquete completo), y preguntas utiles para hacerle al entrevistador. 10 paginas, subido a Cloudinary como `authenticated` (`courses/entrevistas-trabajo-developers.pdf`) y cargado en Supabase. $4.500 ARS, access_type `both`.
- [x] Curso "Venta Consultiva para Developers y Freelancers" (04/08/2026) — primer curso fuera de las 5 categorias originales, categoria nueva `ventas_freelance` ("Ventas para freelancers y devs"). Idea propuesta por el usuario a partir de su propia experiencia (desarrolla bien tecnicamente pero le cuesta vender). Contenido: por que los developers venden mal, el mindset de "vender es diagnosticar", framework SPIN (Situacion/Problema/Implicacion/Necesidad-beneficio) adaptado a lenguaje tecnico con guiones de preguntas reales, investigacion previa del prospecto, estructura de discovery call en 5 fases, errores comunes, transicion de la llamada a la propuesta, y manejo de objeciones tipicas ("es caro", "lo hago con IA", "lo pienso"). 11 paginas, subido a Cloudinary como `authenticated` (`courses/ventas-freelance-discovery-calls.pdf`) y cargado en Supabase. $5.500 ARS, access_type `both`.
  - Requirio agregar la categoria al CHECK constraint de `courses.category` (`docs/schema.sql` actualizado) — como no tengo acceso a una conexion Postgres directa (solo REST/PostgREST), el `ALTER TABLE` lo corrio el usuario a mano en el SQL Editor de Supabase; yo hice el resto (contenido, PDF, Cloudinary, insert final).
  - Tambien se actualizaron `CATEGORY_LABELS` en `src/lib/format.ts` y el `<select>` de categoria en `src/app/(admin)/admin/courses/new/page.tsx`. El catalogo publico (`/cursos`) no necesito cambios porque ya itera `CATEGORY_LABELS` dinamicamente.
  - Nota operativa: en medio de esta tarea el proyecto de Supabase dejo de resolver por DNS (~varios minutos) y al volver dio `PGRST205` (schema cache desactualizado) antes de estabilizarse — consistente con que el proyecto free-tier se habia pausado por inactividad y tardo un momento en levantar del todo al primer request. No requirio ninguna accion mas alla de reintentar.
- [x] Entrega segura de PDFs: acceso por suscripcion ya no permite descargar-y-cancelar (28/07/2026). Problema detectado por el usuario: el mismo `resource_url` publico de Cloudinary se usaba tanto para compra individual como para suscripcion, asi que alguien podia suscribirse, descargar los 4 PDFs, y darse de baja quedandose con todo para siempre. Solucion implementada:
  - Los 4 recursos de `courses/` en Cloudinary se pasaron de `type: upload` (publico) a `type: authenticated` (privado) via la Admin API (`raw/rename` con `to_type=authenticated`, mas `raw/explicit` con `invalidate=true` para forzar el purgado del cache CDN de las URLs publicas viejas — el purgado puede tardar en propagar del todo, Cloudinary lo documenta como "hasta una hora" en casos raros).
  - Nuevo `src/lib/cloudinary.ts`: `extractRawPublicId()` (saca el public_id del `resource_url` guardado en la base) + `getSignedAuthenticatedPdfUrl()` (genera un link firmado nuevo en cada llamada, usando el SDK oficial de `cloudinary`).
  - Nuevo route handler `src/app/api/cursos/[slug]/leer/route.ts`: en cada request valida sesion + acceso (compra `approved` de ese curso, o suscripcion `active`) contra la base en el momento, y solo si corresponde arma el link firmado, trae los bytes del PDF de Cloudinary del lado del servidor, y los devuelve el con `Cache-Control: private, no-store`. El navegador nunca ve una URL de Cloudinary. Si viene por compra: `Content-Disposition: attachment` (lo puede descargar y guardar, lo pago). Si viene solo por suscripcion: `inline` (se ve en el navegador, no invita a guardarlo — el acceso es "mientras este activa", no permanente).
  - Dashboard actualizado: "Mis compras" y "Cursos incluidos en tu suscripcion" ahora apuntan a `/api/cursos/[slug]/leer` en vez del link directo de Cloudinary. Botones renombrados a "Descargar" (compra) y "Leer" (suscripcion) para que coincida con el comportamiento real.
  - Verificado a mano (sin poder correr `next dev` en el sandbox): se replico la logica exacta del route handler con Node — extraccion de public_id, generacion de link firmado, fetch a Cloudinary — contra los 4 cursos reales, devolviendo 200 + los bytes correctos en todos los casos. Pendiente: probar dentro de la app ya deployada (ver To Do).
  - **Convencion para cursos nuevos de aca en adelante**: despues de subir el PDF a Cloudinary con `type: upload` (igual que siempre), hay que convertirlo a `authenticated` con `raw/rename` (`to_type=authenticated`, `invalidate=true`) antes de cargarlo en la tabla `courses` — si no, ese curso queda con descarga publica libre.
- [x] Fix: el acceso por suscripcion igual disparaba una descarga automatica del PDF (28/07/2026). Causa: navegar directo a la URL de `/api/cursos/[slug]/leer` en una pestaña nueva (`target="_blank"`) hace que muchos navegadores fuercen la descarga segun su configuracion propia de manejo de PDFs, sin importar el header `Content-Disposition: inline` que mandaba el servidor. Solucion: nueva pagina `src/app/(dashboard)/dashboard/leer/[slug]/page.tsx` que embebe el PDF en un `<iframe>` dentro de nuestra propia UI (asi se renderiza con el visor de PDF del navegador en vez de navegar directo al archivo). El boton "Leer" de la seccion de suscripcion ahora apunta ahi; el boton "Descargar" de compras individuales sigue apuntando directo a `/api/cursos/[slug]/leer` (target="_blank"), porque ahi si queremos que descargue — es contenido comprado.
- [x] Setup inicial Next.js + estructura de carpetas + docs
- [x] Crear proyecto en Supabase y conectar variables de entorno (10/07/2026)
- [x] Crear schema base de datos (ver DATABASE.md) (10/07/2026)
- [x] Auth (registro/login) con Supabase (10/07/2026)
- [x] Panel admin basico (10/07/2026)
- [x] Definir precios y % de afiliados (13/07/2026)
- [x] Landing publica + catalogo de cursos (13/07/2026)
- [x] Integracion Mercado Pago (Checkout Pro) — compra individual, webhook y dashboard de compras (14/07/2026). Pendiente de configurar credenciales reales, ver DATABASE.md.
- [x] Deploy inicial en Vercel (24/07/2026) — https://my-upgrade-lab.vercel.app
- [x] Emails transaccionales (SMTP) — Gmail con app password (24/07/2026). `src/lib/email.ts` (transporter + templates), enganchado al webhook de Mercado Pago: envia "compra aprobada" cuando una purchase pasa a `approved` y "suscripcion activa" cuando una subscription pasa a `active`, solo en la transicion (no reenvia en notificaciones repetidas).
- [x] Curso "Estudiar con IA: NotebookLM, Claude y Nano Banana" — PDF de 12 paginas armado, subido a Cloudinary y cargado en `courses` del proyecto correcto de Supabase (25/07/2026). $4.000 ARS, categoria estudio_ia, access_type both.
- [x] Migracion de proyecto Supabase (25/07/2026) — de `wrlxeyzouasczduabgxq` (vacio) a `mzylzoqmxprrigdxlwsc` (el real, "MyUpgradeLab" produccion). Corrido `docs/schema.sql` completo (8 tablas + RLS + is_admin() + trigger + backfill). `.env.local` y las Environment Variables de Vercel actualizadas con las nuevas Publishable/Secret keys, y redeployado. Verificado en produccion: `https://my-upgrade-lab.vercel.app/cursos` ya muestra el catalogo real.
- [x] Registro: agregado campo "Confirmar contraseña" con validacion server-side, y auto-login al dashboard si Supabase devuelve sesion activa (depende de que "Confirm email" este desactivado en el proyecto de Supabase) (24/07/2026)
- [x] Canal de comunidad por categoria (24/07/2026) — `src/lib/community.ts` (mapa categoria -> link, vacio por ahora) + seccion "Comunidad" en el dashboard, que solo muestra los links de las categorias a las que el usuario tiene acceso (compra aprobada o suscripcion activa). Falta cargar los links reales, ver To Do.
- [x] Usuario admin creado (25/07/2026) via `update public.profiles set role = 'admin'` en el proyecto correcto de Supabase.
- [x] App dedicada de Checkout Pro creada en el panel de Mercado Pago con credenciales de **PRODUCCION** (25/07/2026) — `MP_ACCESS_TOKEN_CHECKOUT` / `MP_PUBLIC_KEY_CHECKOUT` / `MP_WEBHOOK_SECRET_CHECKOUT` cargados en `.env.local` con prefijo `APP_USR-` (no `TEST-`), o sea que ya procesa pagos reales, no de sandbox. Ojo con esto al probar el flujo de compra.
- [x] Fix: `checkout.ts` y `subscribe.ts` llamaban a `getMercadoPagoConfig()` fuera del `try/catch`, asi que si faltaba el access token tiraba una excepcion sin manejar y crasheaba la pagina en vez de redirigir con un mensaje de error prolijo (encontrado en produccion, 25/07/2026, via el log de Vercel: "Falta configurar MP_ACCESS_TOKEN_CHECKOUT"). Movido el llamado adentro del try en ambos archivos.
- [x] Webhook de Checkout Pro funcionando de punta a punta en produccion (25/07/2026). Causas encontradas y corregidas: (1) la "URL para prueba" en el panel de MP tenia solo el dominio sin el path (`/api/webhooks/mercadopago`), asi que las notificaciones nunca llegaban a la ruta correcta; (2) el evento "Pagos (legacy)" es del tipo IPN clasico que a veces llega como `GET` en vez de `POST`, y la ruta solo tenia handler `POST` — se agrego handler `GET` con la misma logica (`handleNotification` compartida). Confirmado con una compra real de prueba ($4.000, operacion #169682130617): la purchase paso a `approved` sola, sin intervencion manual. Ojo: la URL del webhook hay que configurarla en la pestaña **"Modo productivo"** del panel de MP, no en "Modo de prueba", porque las credenciales son `APP_USR-` (produccion, `live_mode: true`). Nota: el boton "Acceder" en si lleva a un link de Cloudinary que hoy da 401 (ver tarea de Restricted media types en To Do) — eso es un tema aparte de Cloudinary, no de Mercado Pago ni del webhook.
- [x] Una compra de prueba anterior (79bb7cc2-..., pago aprobado en MP pero sin webhook configurado con el path correcto todavia) se corrigio a mano en la base (25/07/2026) una vez identificado el pago real via la API de Payments de MP.
- [x] Cambio de cuenta de Cloudinary (25/07/2026) — nueva cuenta `ydpwntwn` (antes `cienjgys`). `.env.local` actualizado (`CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`), PDF re-subido, y `courses.resource_url` actualizado en Supabase. Habilitado "Allow delivery of PDF and ZIP files" en Settings > Security > Restricted media types de la cuenta nueva (el bloqueo 401 es una config por cuenta, no viaja al migrar). Verificado con curl: 200 + `content-type: application/pdf`.
- [x] Curso "Programar con IA — Nivel 1: Fundamentos" (28/07/2026) — primer PDF de la serie Programación/IA (dividida en 3 niveles por precio/profundidad, ver MASTER.md). Contenido: panorama de herramientas no-code (Lovable, Bolt.new, Replit, v0), estructura de un buen prompt, proyecto guiado paso a paso, glosario minimo, como iterar cuando el resultado no es el esperado, limites y cuidados. 10 paginas, subido a Cloudinary (`courses/programacion-ia-nivel1.pdf`) y cargado en `courses` de Supabase. $4.000 ARS, categoria `programacion_ia`, access_type `both`.
- [x] Curso "Programar con IA — Nivel 2: Flujos de trabajo" (28/07/2026) — segundo PDF de la serie, para quien ya programa. Contenido: comparativa Claude Code / Cursor / GitHub Copilot, puesta en marcha, prompting tecnico con contexto/restricciones/verificacion, casos de uso reales (debugging, refactor, tests, documentacion), integracion a flujo de git, buenas practicas y limites. 11 paginas, subido a Cloudinary (`courses/programacion-ia-nivel2.pdf`) y cargado en `courses` de Supabase. $5.500 ARS, categoria `programacion_ia`, access_type `both`.
- [x] Curso "Programar con IA — Nivel 3: Proyectos completos" (28/07/2026) — cierre de la serie de 3 PDFs de Programación/IA. Contenido: planificar arquitectura antes de programar, construir por etapas verificables (base de datos, backend, frontend, integraciones), testing de casos limite, deploy a produccion, mantenimiento (logs, monitoreo), errores comunes en proyectos reales con IA. 10 paginas, subido a Cloudinary (`courses/programacion-ia-nivel3.pdf`) y cargado en `courses` de Supabase. $7.000 ARS, categoria `programacion_ia`, access_type `both`. Con esto la serie completa de Programación/IA (Niveles 1, 2 y 3) esta cargada y verificada en Supabase.
