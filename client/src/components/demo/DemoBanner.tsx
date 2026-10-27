import { FlaskConical } from "lucide-react";

export default function DemoBanner() {
  return (
    <aside className="demo-global-strip" aria-label="وضع العرض التجريبي">
      <FlaskConical size={15} aria-hidden="true" />
      <span>
        <strong>نسخة عرض</strong> — الطلبات والمدفوعات تجريبية
      </span>
    </aside>
  );
}
