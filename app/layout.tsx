import type { Metadata, Viewport } from "next";
import { Bowlby_One, DM_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const bowlby = Bowlby_One({ variable: "--font-bowlby", weight: "400", subsets: ["latin"] });
const dm = DM_Sans({ variable: "--font-dm", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ghent Crawl",
  description: "Six stops. One night. Follow the map.",
};

export const viewport: Viewport = {
  themeColor: "#1a0526",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bowlby.variable} ${dm.variable} antialiased`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
