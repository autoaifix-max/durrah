import type { Metadata } from "next";
import MenuShell from "@/components/menu/MenuShell";
import CartPage from "@/components/demo/CartPage";

export const metadata: Metadata = {
  title: "درة العنب | سلة طلبك",
  description:
    "نسخة عرض لدرة العنب؛ الطلبات والمدفوعات تجريبية ولا ترسل إلى الفروع.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <MenuShell view="cart">
      <CartPage />
    </MenuShell>
  );
}
