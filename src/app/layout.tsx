import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Karla } from "next/font/google";
import "./globals.css";

// Only the weights actually used ship — each one is a separate woff2 fetched on
// every visit. Display: 300 (hero subhead), 400 (headings), 500 (wordmark).
// Body: 400 (copy), 500 (eyebrows/labels), 600 (buttons).
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * The origin that og:image and other absolute metadata URLs are built from.
 * A hardcoded placeholder domain here means every link preview resolves against
 * a host that doesn't exist — so the card is blank everywhere the site is shared.
 * Resolved from the environment instead, so it's correct on Vercel with no edit:
 *   NEXT_PUBLIC_SITE_URL          — set this once a custom domain exists
 *   VERCEL_PROJECT_PRODUCTION_URL — injected by Vercel; the stable prod domain
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Kayumanggi — A Filipino Culinary Voyage · BGC";
const description =
  "One Filipino palate, four kitchens — Manila, Tokyo, Paris, Roma. A candlelit voyage through world cuisine in BGC, Manila.";

export const metadata: Metadata = {
  title,
  description:
    "A candlelit dining room in Bonifacio Global City where one Filipino palate travels through Tokyo, Paris and Rome. Four kitchens, one table. Reservations for dinner, Tuesday to Sunday.",
  metadataBase: new URL(siteUrl),
  openGraph: { title, description, type: "website", url: siteUrl },
  // Without this, X/Twitter renders a small thumbnail instead of the wide card.
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#14100C",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The pre-paint script below adds `.anim-ready` to <html> before React
      // hydrates (no-flash motion gate). That deliberate mutation makes the live
      // DOM differ from the server HTML, so we suppress the shallow, expected
      // hydration warning on this element only — same pattern theme scripts use.
      suppressHydrationWarning
      className={`${cormorant.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="min-h-full grain">
        <script
          // Apply hidden initial states pre-paint ONLY when motion is welcome.
          // No-JS or reduced-motion users get a fully visible, static page.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches){document.documentElement.classList.add('anim-ready')}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
