import type { Metadata } from "next";
import MenuShell from "@/components/menu/MenuShell";
import CheckoutPage from "@/components/demo/CheckoutPage";

export const metadata: Metadata = {
  title: "درة العنب | إكمال الطلب التجريبي",
  description:
    "نسخة عرض لدرة العنب؛ الطلبات والمدفوعات تجريبية ولا ترسل إلى الفروع.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <MenuShell view="checkout">
      <CheckoutPage />
    </MenuShell>
  );
}
