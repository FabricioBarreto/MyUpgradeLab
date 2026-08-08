import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getAppUrl } from "@/lib/constants";
import { Analytics } from "@/components/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// metadataBase es necesario para que las URLs relativas de openGraph/twitter
// (usadas en generateMetadata de paginas como cursos/[slug]) se resuelvan a
// absolutas — sin esto, WhatsApp/LinkedIn no arman bien la preview del link.
const appUrl = getAppUrl()

export const metadata: Metadata = {
  ...(appUrl ? { metadataBase: new URL(appUrl) } : {}),
  title: {
    default: "UpgradeLab",
    template: "%s · UpgradeLab",
  },
  description: "Cursos y recursos de programacion/IA, estudio con IA, ingles, entrevistas de trabajo y negocio para freelancers.",
  openGraph: {
    siteName: "UpgradeLab",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
