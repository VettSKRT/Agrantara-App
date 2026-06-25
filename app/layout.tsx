import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Agrantara — Farmer Compliance",
  description: "Platform manajemen lahan pertanian dan kepatuhan EUDR",
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
