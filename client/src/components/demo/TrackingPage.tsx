"use client";

import {
  Check,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  ShoppingBag,
  Truck,
  Store,
  ArrowLeft,
  FlaskConical,
} from "lucide-react";
import { useDemo } from "./DemoProvider";
import { demoBranches } from "@/data/demo";
import { getMenuProduct } from "@/data/menu";
import { formatArabicNumber } from "@/data/brand";

export default function TrackingPage() {
  const { order, hydrated, advanceOrder } = useDemo();
  if (!hydrated)
    return (
      <div className="demo-loading" role="status">
        نجهّز تأكيد العرض…
      </div>
    );
  if (!order)
    return (
      <div className="demo-empty">
        <span className="demo-empty-icon">
          <PackageCheck size={39} />
        </span>
        <h1>لا يوجد طلب تجريبي بعد</h1>
        <p>أكمل تجربة الطلب من السلة لمشاهدة التأكيد والتتبع.</p>
        <a className="demo-primary" href="/menu/">
          ابدأ من قائمة الطعام
        </a>
      </div>
    );
  const branch = demoBranches.find(item => item.id === order.branchId);
  const pickup = order.fulfillment === "pickup";
  const stages = [
    {
      title: "تم استلام الطلب",
      detail: "استلام تجريبي على المتصفح",
      Icon: ShoppingBag,
    },
    { title: "جارٍ التحضير", detail: "محاكاة تجهيز أصنافك", Icon: ChefHat },
    {
      title: pickup ? "جاهز للاستلام" : "خرج للتوصيل",
      detail: pickup ? "محاكاة تجهيز الاستلام" : "محاكاة حركة الطلب",
      Icon: PackageCheck,
    },
    {
      title: pickup ? "تم الاستلام" : "تم التوصيل",
      detail: "اكتملت تجربة العرض، وليس طلبًا حقيقيًا",
      Icon: pickup ? Store : Truck,
    },
  ];
  const payment =
    order.payment === "apple-pay"
      ? "Apple Pay"
      : order.payment === "mada"
        ? "مدى"
        : "عند الاستلام";
  return (
    <section className="demo-screen">
      <div className="demo-success">
        <span className="demo-success-icon">
          <CheckCircle2 size={45} />
        </span>
        <span className="d-menu-eyebrow">شكرًا لتجربة درة العنب</span>
        <h1>تم تأكيد طلبك التجريبي</h1>
        <p>
          هذه محاكاة كاملة لمسار الطلب؛ لم يتم إرسال طلب أو إجراء دفع حقيقي.
        </p>
        <span className="demo-order-id" dir="ltr">
          {order.id}
        </span>
      </div>
      <div className="demo-panel">
        <div className="demo-track-heading">
          <h2>تابع مراحل طلبك</h2>
          <span className="demo-small-tag">محاكاة</span>
        </div>
        <ol className="demo-timeline">
          {stages.map(({ title, detail, Icon }, index) => (
            <li
              key={title}
              className={
                index < order.step
                  ? "done"
                  : index === order.step
                    ? "current"
                    : "pending"
              }
              aria-current={index === order.step ? "step" : undefined}
            >
              <span className="demo-stage-icon">
                {index < order.step ? <Check size={21} /> : <Icon size={22} />}
              </span>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
              {index === order.step && (
                <span className="demo-live-dot" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
        {order.step < stages.length - 1 ? (
          <button
            type="button"
            className="demo-next-stage"
            onClick={advanceOrder}
          >
            <FlaskConical size={17} /> محاكاة المرحلة التالية{" "}
            <ArrowLeft size={17} />
          </button>
        ) : (
          <div className="demo-completed" role="status">
            <CheckCircle2 size={19} /> اكتملت جميع مراحل المحاكاة
          </div>
        )}
        <p className="demo-caption">
          تغيير المراحل محلي ولا يعكس حالة فرع أو مندوب. لا يوجد وقت وصول فعلي.
        </p>
      </div>
      <div className="demo-panel demo-receipt">
        <h2>تفاصيل العرض</h2>
        <div className="demo-review-branch">
          <span>الفرع</span>
          <strong>{branch?.label ?? "فرع تجريبي"}</strong>
        </div>
        <div className="demo-review-branch">
          <span>طريقة الاستلام</span>
          <strong>{pickup ? "استلام من الفرع" : "توصيل"}</strong>
        </div>
        <div className="demo-review-branch">
          <span>الدفع</span>
          <strong>{payment} · محاكاة فقط</strong>
        </div>
        <div className="demo-review-branch">
          <span>العميل</span>
          <strong>عميل العرض · بيانات تجريبية</strong>
        </div>
        {order.lines.map(line => {
          const product = getMenuProduct(line.productSlug);
          const option = product?.options.find(
            item => item.id === line.optionId
          );
          if (!product || !option) return null;
          return (
            <div
              className="demo-review-line"
              key={`${line.productSlug}:${line.optionId}`}
            >
              <span>
                <strong>{product.name}</strong>
                <small>
                  {option.label} × {formatArabicNumber(line.quantity)}
                </small>
              </span>
              <span>
                {formatArabicNumber(option.priceSar * line.quantity)} ر.س
              </span>
            </div>
          );
        })}
        <div className="demo-review-total">
          <span>إجمالي المنتجات</span>
          <strong>
            {formatArabicNumber(order.totalSar)} <small>ر.س</small>
          </strong>
        </div>
        <p className="demo-caption">
          لا خصم ولا تحصيل. الضريبة والتوصيل غير محسوبين، والتأكيد ليس فاتورة أو
          إثبات دفع.
        </p>
      </div>
      <a className="demo-primary" href="/menu/">
        تجربة طلب آخر <ArrowLeft size={20} />
      </a>
      <p className="demo-fine-print">
        هذا التأكيد محفوظ على جهازك فقط ولا يمكن مشاركته كطلب حقيقي.
      </p>
    </section>
  );
}
