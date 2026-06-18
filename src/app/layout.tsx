import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono, Geist, Noto_Color_Emoji } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });
const emoji = Noto_Color_Emoji({ subsets: ["emoji"], weight: "400", variable: "--font-emoji" });

export const metadata: Metadata = {
  title: "BowlSync",
  description: "Did the dog get fed? A shared feeding tracker for your household.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", display.variable, body.variable, mono.variable, "font-sans", geist.variable, emoji.variable)}
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-body)">{children}</body>
    </html>
  );
}
