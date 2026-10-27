import type { Metadata } from "next";
import MenuShell from "@/components/menu/MenuShell";
import TrackingPage from "@/components/demo/TrackingPage";

export const metadata: Metadata = {
  title: "درة العنب | تأكيد الطلب والتتبع التجريبي",
  description:
    "نسخة عرض لدرة العنب؛ الطلبات والمدفوعات تجريبية ولا ترسل إلى الفروع.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <MenuShell view="tracking">
      <TrackingPage />
    </MenuShell>
  );
}
