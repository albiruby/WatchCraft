import type { Metadata } from "next";
import { Instrument_Serif, Inter, Red_Hat_Display } from "next/font/google";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const display = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-red-hat-display",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "WATCHCRAFT",
  description:
    "Studio watch face Garmin: rancang di browser, bangun .prg, jalankan di jam.",
};

// Pilihan tersimpan menang. Tanpa pilihan, ikut tema sistem.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("watchcraft-theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t)}catch(e){d.setAttribute("data-theme","light")}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      data-theme="light"
      className={`${sans.variable} ${display.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
