import type { Metadata } from "next";
import MenuShell from "@/components/menu/MenuShell";
import BranchPicker from "@/components/demo/BranchPicker";

export const metadata: Metadata = {
  title: "درة العنب | اختيار الفرع التجريبي",
  description:
    "نسخة عرض لدرة العنب؛ الطلبات والمدفوعات تجريبية ولا ترسل إلى الفروع.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <MenuShell view="branches">
      <BranchPicker />
    </MenuShell>
  );
}
