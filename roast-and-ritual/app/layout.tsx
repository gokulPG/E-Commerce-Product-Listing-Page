import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/fjalla-one/400.css";
import "@fontsource/karla/400.css";
import "@fontsource/karla/500.css";
import "@fontsource/karla/600.css";
import "@fontsource/karla/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Roast & Ritual — Specialty Coffee & Brew Gear",
  description:
    "Single-origin beans, brewers, grinders, and accessories for the home barista.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}