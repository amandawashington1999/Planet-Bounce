import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Planet Bounce | FHE Guessing Game",
  description: "A privacy-preserving planet guessing game powered by Fully Homomorphic Encryption",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>{children}</Providers>
        {/* CRT Scanlines Overlay */}
        <div className="scanlines" />
        {/* Perspective Grid */}
        <div className="grid-bg" />
        {/* Floating Sun */}
        <div className="sun-glow" />
      </body>
    </html>
  );
}

