import type { Metadata, Viewport } from "next";
import { EB_Garamond, UnifrakturMaguntia } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SealDefs } from "@/components/WaxSeal";
import "./globals.css";

const blackletter = UnifrakturMaguntia({ variable: "--font-blackletter", weight: "400", subsets: ["latin"] });
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
