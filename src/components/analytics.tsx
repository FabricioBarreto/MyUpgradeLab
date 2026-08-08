import Script from "next/script"

// Google Analytics (GA4) y Meta Pixel, cada uno activo solo si esta cargada
// la env var correspondiente — asi no hay que tocar codigo para prenderlos,
// alcanza con cargar NEXT_PUBLIC_GA_ID y/o NEXT_PUBLIC_META_PIXEL_ID en
// Vercel (Project Settings > Environment Variables) y redeployar.
//
// Nota de cumplimiento: la pagina de /cookies ya explica que se usan cookies
// de analitica, pero hoy no hay un banner que pida consentimiento antes de
// cargar estos scripts (se cargan directo). Para Argentina esto es practica
// comun, pero si en algun momento se quiere ser mas estrictos con Ley 25.326,
// lo prolijo seria no montar este componente hasta que la persona acepte.
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  )
}
