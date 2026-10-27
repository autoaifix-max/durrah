import type { Metadata } from "next";
import MenuShell from "@/components/menu/MenuShell";
import MenuCatalog from "@/components/menu/MenuCatalog";

const title = "درة العنب | قائمة الطعام المصوّرة والأسعار المعتمدة";
const description =
  "تصفّح ورق العنب والملفوف والفتة والكبة والمحاشي مع الأحجام والأسعار المعتمدة، وجرّب السلة وإكمال الطلب. نسخة عرض؛ الطلبات والمدفوعات تجريبية.";
const logo =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663747665183/kmzvJomPfsvkGzaX.png";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    siteName: "درة العنب",
    type: "website",
    locale: "ar_SA",
    images: [{ url: logo, alt: "شعار درة العنب" }],
  },
  twitter: { card: "summary", title, description, images: [logo] },
};

export default function MenuPage() {
  return (
    <MenuShell>
      <MenuCatalog />
    </MenuShell>
  );
}
