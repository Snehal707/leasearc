import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LazyStarfield } from "./components/LazyStarfield";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeaseArc | Arc Testnet",
  description: "Rent a name for 1–365 days in USDC; renew or it expires and others can reclaim it. ~1¢ per tx · 1 second finality on Arc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased font-sans`}>
        <div className="space-bg" aria-hidden>
          <img
            src="https://images.unsplash.com/photo-1504333638930-c8787321efa0?q=80&w=2000&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen pointer-events-none"
          />
          <LazyStarfield />
          <div className="css-3d-earth absolute top-1/2 -translate-y-1/2 -right-[400px] h-[1000px] w-[1000px] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#02040A] via-[#02040A]/40 to-transparent pointer-events-none z-0" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
