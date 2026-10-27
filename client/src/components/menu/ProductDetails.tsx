"use client";

import { useId, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatArabicNumber } from "@/data/brand";
import { calculateProductTotal, type MenuProduct } from "@/data/menu";
import { useDemo } from "@/components/demo/DemoProvider";

export default function ProductDetails({ product }: { product: MenuProduct }) {
  const { addItem, hydrated } = useDemo();
  const [added, setAdded] = useState("");
  const [optionId, setOptionId] = useState(
    product.options[product.options.length === 7 ? 1 : 0].id
  );
  const [quantityText, setQuantityText] = useState("1");
  const option =
    product.options.find(item => item.id === optionId) ?? product.options[0];
  const quantity = Number(quantityText);
  const validQuantity =
    /^[0-9]+$/.test(quantityText) &&
    Number.isSafeInteger(quantity) &&
    quantity >= 1 &&
    quantity <= 99 &&
    Number.isSafeInteger(quantity * option.priceSar);
  const total = validQuantity
    ? calculateProductTotal(product, option.id, quantity)
    : null;
  const fieldId = useId();
  const updateText = (value: string) =>
    setQuantityText(
      value.replace(/[٠-٩]/g, character =>
        String("٠١٢٣٤٥٦٧٨٩".indexOf(character))
      )
    );
  const hasPack = option.pieces !== null;
  const quantityLabel = hasPack ? "عدد البوكسات" : "الكمية";
  const imageAlt = product.imageShared
    ? "صورة مشتركة للتصنيف من قائمة درة العنب؛ ليست تصويرًا مستقلًا لكل خيار"
    : `صورة ${product.name} من قائمة درة العنب`;

  return (
    <article className="d-product-detail">
      <div className="d-detail-photo">
        <img
          src={product.imageSrc}
          width={product.imageWidth}
          height={product.imageHeight}
          alt={imageAlt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="d-detail-info">
        <div>
          <h1>{product.name}</h1>
          {product.flavor && (
            <span
              className={`d-flavor-inline ${product.flavor === "سبايسي" ? "is-spicy" : ""}`}
            >
              {product.flavor}
            </span>
          )}
        </div>
        <p>
          {product.options.length > 1
            ? "اختر عدد الحبات داخل البوكس."
            : hasPack
              ? "السعر للبوكس كاملًا."
              : "السعر المعتمد لهذا الخيار من قائمتنا."}
          {hasPack && (
            <>
              <br />
              السعر الموضّح لكل بوكس كامل، وليس سعر الحبة.
            </>
          )}
        </p>
        {product.imageShared && (
          <small>
            الصورة مشتركة للتصنيف، وليست تصويرًا مستقلًا لهذا الخيار.
          </small>
        )}
      </div>
      <fieldset className="d-pack-choices">
        <legend>
          {product.options.length > 1
            ? "حجم البوكس"
            : "الخيار المتاح في القائمة"}
        </legend>
        <p className="d-choice-hint">
          {product.options.length > 1 ? "اختر حجمًا واحدًا" : "السعر المعتمد"}
        </p>
        {product.options.map(item => (
          <label
            className={`d-pack-choice ${option.id === item.id ? "selected" : ""}`}
            key={item.id}
          >
            <input
              type="radio"
              name={`pack-${product.slug}`}
              value={item.id}
              checked={option.id === item.id}
              onChange={() => setOptionId(item.id)}
            />
            <span>{item.label}</span>
            <strong>
              {formatArabicNumber(item.priceSar)} <small>ر.س</small>
            </strong>
          </label>
        ))}
      </fieldset>
      {product.slug === "mahshi" && (
        <p className="d-mahshi-note">
          خيارات التشكيل في القائمة: بطاطس، فلفل رومي، بصل، كوسة، باذنجان. أسعار
          البوكس للمحاشي المشكلة، وليست أسعارًا مستقلة لكل نوع.
        </p>
      )}
      <div className="d-quantity">
        <div>
          <label htmlFor={fieldId}>{quantityLabel}</label>
          <p>
            {hasPack
              ? "عدد البوكسات، لا عدد الحبات"
              : "عدد الوحدات من هذا المنتج"}
          </p>
        </div>
        <div className="d-stepper">
          <button
            type="button"
            onClick={() =>
              setQuantityText(String(validQuantity ? quantity + 1 : 1))
            }
            disabled={
              (validQuantity && quantity >= 99) ||
              (validQuantity &&
                !Number.isSafeInteger((quantity + 1) * option.priceSar))
            }
            aria-label={hasPack ? "زيادة عدد البوكسات" : "زيادة الكمية"}
          >
            <Plus size={19} />
          </button>
          <input
            id={fieldId}
            inputMode="numeric"
            pattern="[0-9٠-٩]*"
            type="text"
            value={quantityText}
            maxLength={2}
            onChange={event => updateText(event.target.value)}
            aria-invalid={!validQuantity}
            aria-describedby={!validQuantity ? `${fieldId}-error` : undefined}
            autoComplete="off"
          />
          <button
            type="button"
            disabled={!validQuantity || quantity <= 1}
            onClick={() => setQuantityText(String(quantity - 1))}
            aria-label={hasPack ? "تقليل عدد البوكسات" : "تقليل الكمية"}
          >
            <Minus size={19} />
          </button>
        </div>
      </div>
      {!validQuantity && (
        <p id={`${fieldId}-error`} className="d-quantity-error" role="alert">
          أدخل عددًا صحيحًا من ١ إلى ٩٩؛ هذا حد الكمية في العرض التجريبي فقط.
        </p>
      )}
      <div className="d-product-summary" aria-live="polite">
        <div className="d-summary-row">
          <span>
            {option.label}
            {validQuantity
              ? ` × ${formatArabicNumber(quantity)} ${hasPack ? "بوكس" : "وحدة"}`
              : ""}
          </span>
          <span>
            {total !== null ? `${formatArabicNumber(total)} ر.س` : "—"}
          </span>
        </div>
        <div className="d-summary-total">
          <span>إجمالي المنتجات</span>
          <strong>
            {total !== null ? formatArabicNumber(total) : "—"}{" "}
            <small>ر.س</small>
          </strong>
        </div>
      </div>
      <div className="d-detail-order-area">
        <button
          type="button"
          className="d-add-to-cart"
          disabled={!validQuantity || !hydrated}
          onClick={() =>
            setAdded(
              addItem(product.slug, option.id, quantity)
                ? "تمت الإضافة إلى السلة التجريبية"
                : "بلغت حد ٩٩ لهذا الخيار في سلة العرض؛ عدّل الكمية من السلة."
            )
          }
          aria-describedby="ordering-unavailable"
        >
          <span>
            <ShoppingBag size={19} aria-hidden="true" /> أضف إلى السلة
          </span>
          <strong>
            {total !== null ? formatArabicNumber(total) : "—"}{" "}
            <small>ر.س</small>
          </strong>
        </button>
        {added && (
          <p className="demo-add-result" role="status">
            {added}
            <a href="/menu/cart/">عرض السلة</a>
          </p>
        )}
        <p id="ordering-unavailable">
          <strong>نسخة عرض — السلة والطلبات والمدفوعات تجريبية.</strong>
          <br />
          رسوم التوصيل غير محسوبة، ولم يُؤكَّد وضع الضريبة. التوافر حسب الفرع.
        </p>
      </div>
      {product.options.length === 7 && (
        <p className="d-equal-prices">
          <Check size={16} aria-hidden="true" /> نفس خيارات البوكس وأسعاره
          للكلاسيك والسبايسي من ورق العنب والملفوف.
        </p>
      )}
    </article>
  );
}
