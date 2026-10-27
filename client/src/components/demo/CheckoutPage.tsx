"use client";

import { useState } from "react";
import {
  Banknote,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { useDemo } from "./DemoProvider";
import BranchPicker from "./BranchPicker";
import { demoBranches } from "@/data/demo";
import { formatArabicNumber } from "@/data/brand";

const paymentChoices = [
  {
    id: "apple-pay",
    label: "Apple Pay",
    detail: "تجربة دفع سريعة",
    Icon: ShieldCheck,
  },
  { id: "mada", label: "مدى", detail: "محاكاة بطاقة مدى", Icon: CreditCard },
  {
    id: "cash",
    label: "عند الاستلام",
    detail: "محاكاة الدفع عند الاستلام",
    Icon: Banknote,
  },
] as const;

export default function CheckoutPage() {
  const {
    items,
    totalSar,
    branchId,
    fulfillment,
    payment,
    order,
    hydrated,
    setFulfillment,
    setPayment,
    placeOrder,
  } = useDemo();
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const selectedBranch = demoBranches.find(branch => branch.id === branchId);
  const confirm = () => {
    if (placing) return;
    if (!selectedBranch) {
      setError("اختر فرعًا تجريبيًا لإكمال العرض.");
      return;
    }
    setPlacing(true);
    const nextOrder = placeOrder();
    if (nextOrder) window.location.assign("/menu/tracking/");
    else {
      setPlacing(false);
      setError("راجع السلة والفرع ثم أعد المحاولة.");
    }
  };
  if (!hydrated)
    return (
      <div className="demo-loading" role="status">
        نجهّز طلبك…
      </div>
    );
  if (!items.length)
    return (
      <div className="demo-empty">
        <span className="demo-empty-icon">
          <ShoppingBag size={38} />
        </span>
        <h1>اختر أصنافك أولًا</h1>
        <p>أضف منتجات للسلة لتجربة إكمال الطلب.</p>
        <a className="demo-primary" href="/menu/">
          قائمة الطعام
        </a>
        {order && (
          <a className="demo-more" href="/menu/tracking/">
            عرض آخر طلب تجريبي
          </a>
        )}
      </div>
    );
  return (
    <section className="demo-screen">
      <div className="demo-title">
        <span className="d-menu-eyebrow">خطوة أخيرة لتجربة الطلب</span>
        <h1>إكمال الطلب</h1>
        <p>تفاصيل واضحة، وتجربة سهلة من الجوال.</p>
      </div>
      <div className="demo-panel">
        <h2 className="demo-section-title">
          <span>١</span> كيف تستلم طلبك؟
        </h2>
        <div
          className="demo-fulfillment"
          role="group"
          aria-label="طريقة الاستلام"
        >
          <button
            type="button"
            aria-pressed={fulfillment === "pickup"}
            className={fulfillment === "pickup" ? "selected" : ""}
            onClick={() => setFulfillment("pickup")}
          >
            <Store size={25} />
            <strong>استلام من الفرع</strong>
            <small>تجربة استلام</small>
          </button>
          <button
            type="button"
            aria-pressed={fulfillment === "delivery"}
            className={fulfillment === "delivery" ? "selected" : ""}
            onClick={() => setFulfillment("delivery")}
          >
            <Truck size={25} />
            <strong>توصيل</strong>
            <small>تجربة توصيل</small>
          </button>
        </div>
        <BranchPicker compact />
        <p className="demo-caption">
          <MapPin size={15} /> الأسماء والمواقع ونطاق التوصيل الفعلية تُضاف عند
          التفعيل.
        </p>
      </div>
      <div className="demo-panel">
        <h2 className="demo-section-title">
          <span>٢</span> بيانات العميل
        </h2>
        <div className="demo-customer">
          <span className="demo-customer-icon">
            <UserRound size={24} />
          </span>
          <div>
            <strong>عميل العرض</strong>
            <span dir="ltr">05XXXXXXXX</span>
          </div>
          <span className="demo-small-tag">بيانات تجريبية</span>
        </div>
        {fulfillment === "delivery" && (
          <div className="demo-address">
            <MapPin size={20} />
            <span>
              <strong>عنوان تجريبي</strong>
              <small>للعرض فقط؛ لا يُستخدم للتوصيل.</small>
            </span>
          </div>
        )}
        <p className="demo-caption">
          لا حاجة لإدخال اسم أو رقم هاتف أو عنوان حقيقي.
        </p>
      </div>
      <fieldset className="demo-panel demo-payment">
        <legend>
          <span className="demo-section-title">
            <span>٣</span> طريقة الدفع
          </span>
        </legend>
        {paymentChoices.map(({ id, label, detail, Icon }) => (
          <label
            key={id}
            className={`demo-payment-option ${payment === id ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="demo-payment"
              value={id}
              checked={payment === id}
              onChange={() => setPayment(id)}
            />
            <Icon size={24} />
            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
            <span className="demo-small-tag">تجريبي</span>
            {payment === id && <Check size={17} />}
          </label>
        ))}
        <p className="demo-caption">
          لا تُطلب بيانات بطاقة ولا يُخصم أي مبلغ؛ جميع طرق الدفع محاكاة فقط.
        </p>
      </fieldset>
      <div className="demo-panel demo-review">
        <h2>ملخص طلبك</h2>
        {items.map(({ line, product, option, totalSar: lineTotal }) => (
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
            <span>{formatArabicNumber(lineTotal)} ر.س</span>
          </div>
        ))}
        <div className="demo-review-branch">
          <span>الفرع</span>
          <strong>{selectedBranch?.label ?? "لم يُختر بعد"}</strong>
        </div>
        <div className="demo-review-total">
          <span>إجمالي المنتجات</span>
          <strong>
            {formatArabicNumber(totalSar)} <small>ر.س</small>
          </strong>
        </div>
        <p className="demo-caption">
          الضريبة والتوصيل غير محسوبين؛ هذه ليست فاتورة ضريبية أو مبلغ دفع
          حقيقي.
        </p>
      </div>
      {error && (
        <p className="demo-error" role="alert">
          {error}
        </p>
      )}
      <div className="demo-mobile-dock demo-checkout-dock" aria-label="تأكيد الطلب التجريبي">
        <div className="demo-mobile-dock-total">
          <span>إجمالي المنتجات</span>
          <strong>{formatArabicNumber(totalSar)} <small>ر.س</small></strong>
        </div>
        <button
          type="button"
          className="demo-primary demo-confirm-order"
          disabled={placing}
          onClick={confirm}
        >
          <span>{placing ? "جارٍ تأكيد العرض…" : "تأكيد تجريبي"}</span>
          <strong>{formatArabicNumber(totalSar)} ر.س</strong>
        </button>
      </div>
      <p className="demo-fine-print">
        <ShieldCheck size={17} /> ينشأ تأكيد على هذا المتصفح فقط، ولا يُرسل إلى
        الفرع أو أي جهة دفع.
      </p>
    </section>
  );
}
