import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { DemoProvider } from "@/components/demo/DemoProvider";
import DemoBanner from "@/components/demo/DemoBanner";
import "../client/src/index.css";
import "../client/src/styles/menu.css";
import "../client/src/styles/demo.css";

const tajawal = localFont({
  src: [
    {
      path: "../public/fonts/tajawal-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/tajawal-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/tajawal-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/tajawal-800.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

const title = "درة العنب | ورق عنب وفتة وكبة ومحاشي — طازج يومياً";
const description =
  "درة العنب: قائمة مصورة وأسعار معتمدة وسلة وتجربة طلب تفاعلية. نسخة عرض؛ الطلبات والمدفوعات تجريبية وليست تشغيلًا تجاريًا.";
const image =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663747665183/kmzvJomPfsvkGzaX.png";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["درة العنب", "ورق عنب", "ملفوف", "كبة", "محاشي"],
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/brand/logo.svg", type: "image/svg+xml" }] },
  openGraph: {
    title,
    description,
    siteName: "درة العنب",
    locale: "ar_SA",
    type: "website",
    images: [{ url: image, width: 640, height: 800, alt: "شعار درة العنب" }],
  },
  twitter: { card: "summary", title, description, images: [image] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#028954",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body>
        <DemoProvider>
          <DemoBanner />
          {children}
        </DemoProvider>
      </body>
    </html>
  );
}
