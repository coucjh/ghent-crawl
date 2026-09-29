import type { Metadata, Viewport } from "next";
import { EB_Garamond, Grenze_Gotisch } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SealDefs } from "@/components/WaxSeal";
import "./globals.css";

// A legible gothic: keeps the monastic blackletter feel without Fraktur's unreadable capitals.
const blackletter = Grenze_Gotisch({ variable: "--font-blackletter", weight: "variable", subsets: ["latin"] });
const garamond = EB_Garamond({ variable: "--font-garamond", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "The Ghent Abbey Crawl",
  description: "Five Stations, one Book of Judgement.",
};

export const viewport: Viewport = {
  themeColor: "#6b1420",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${blackletter.variable} ${garamond.variable} antialiased`}>
      <body className="min-h-dvh">
        <SealDefs />
        <Providers>
          <div className="mx-auto max-w-md px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
