import "./globals.css";

export const metadata = {
  title: "EQUINOX — Smart Stock Intelligence",
  description:
    "Analisis fundamental saham secara cerdas. Temukan harga wajar, skor investasi, dan rekomendasi berbasis data.",
  keywords: "saham, investasi, fundamental, analisis, harga wajar, PBV, ROE, Indonesia",
  authors: [{ name: "Amran" }],
  robots: "index, follow",
  openGraph: {
    title: "EQUINOX — Smart Stock Intelligence",
    description: "Platform analisis saham berbasis fundamental untuk investor cerdas.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07070d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
