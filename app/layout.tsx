import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Agrantara — Farmer Compliance Platform",
  description: "Platform manajemen lahan pertanian dan kepatuhan regulasi EUDR untuk petani Indonesia.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png" },
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster richColors position="top-right" closeButton duration={4000} />
      </body>
    </html>
  );
}
