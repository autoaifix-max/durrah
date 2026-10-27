"use client";

import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useDemo } from "./DemoProvider";
import { formatArabicNumber } from "@/data/brand";

export default function CartPage() {
  const {
    items,
    totalSar,
    totalQuantity,
    hydrated,
    updateQuantity,
    removeItem,
  } = useDemo();
  if (!hydrated)
    return (
      <div className="demo-loading" role="status">
        نجهّز سلتك…
      </div>
    );
  if (!items.length)
    return (
      <div className="demo-empty">
        <span className="demo-empty-icon">
          <ShoppingBag size={39} />
        </span>
        <h1>سلتك بانتظار أول اختيار</h1>
        <p>اختر من قائمتنا، وحدّد حجم البوكس الذي يناسبك.</p>
        <a className="demo-primary" href="/menu/">
          اكتشف قائمة الطعام <ArrowLeft size={19} />
        </a>
      </div>
    );
  return (
    <section className="demo-screen">
      <div className="demo-title">
        <span className="d-menu-eyebrow">اختياراتك، في مكان واحد</span>
        <h1>سلة طلبك</h1>
        <p>{formatArabicNumber(totalQuantity)} بوكس / وحدة من أصنافنا</p>
      </div>
      <div className="demo-cart-lines">
        {items.map(({ line, product, option, totalSar: lineTotal }) => (
          <article
            className="demo-cart-line"
            key={`${line.productSlug}:${line.optionId}`}
            data-cart-product={line.productSlug}
            data-cart-option={line.optionId}
          >
            <a href={`/menu/${product.slug}/`} className="demo-cart-photo">
              <img
                src={product.imageSrc}
                width={product.imageWidth}
                height={product.imageHeight}
                alt={
                  product.imageShared
                    ? "صورة مشتركة للتصنيف من القائمة"
                    : product.name
                }
              />
            </a>
            <div className="demo-cart-info">
              <a href={`/menu/${product.slug}/`}>
                <h2>{product.name}</h2>
              </a>
              <p>{option.label}</p>
              <strong>
                {formatArabicNumber(lineTotal)} <small>ر.س</small>
              </strong>
              <div className="demo-cart-tools">
                <div className="d-stepper">
                  <button
                    type="button"
                    disabled={line.quantity >= 99}
                    onClick={() =>
                      updateQuantity(
                        line.productSlug,
                        line.optionId,
                        line.quantity + 1
                      )
                    }
                    aria-label={`زيادة كمية ${product.name} ${option.label}`}
                  >
                    <Plus size={17} />
                  </button>
                  <span>{formatArabicNumber(line.quantity)}</span>
                  <button
                    type="button"
                    disabled={line.quantity <= 1}
                    onClick={() =>
                      updateQuantity(
                        line.productSlug,
                        line.optionId,
                        line.quantity - 1
                      )
                    }
                    aria-label={`تقليل كمية ${product.name} ${option.label}`}
                  >
                    <Minus size={17} />
                  </button>
                </div>
                <button
                  type="button"
                  className="demo-trash"
                  onClick={() => removeItem(line.productSlug, line.optionId)}
                  aria-label={`حذف ${product.name} ${option.label}`}
                >
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <a href="/menu/" className="demo-more">
        <Plus size={18} />
        أضف صنفًا آخر
      </a>
      <div className="demo-panel demo-bill">
        <div>
          <span>إجمالي المنتجات</span>
          <strong>{formatArabicNumber(totalSar)} ر.س</strong>
        </div>
        <p>الضريبة والتوصيل غير محسوبين في العرض؛ لا يُخصم أي مبلغ.</p>
      </div>
      <div className="demo-mobile-dock demo-cart-dock" aria-label="ملخص السلة">
        <div className="demo-mobile-dock-total">
          <span>إجمالي المنتجات</span>
          <strong>{formatArabicNumber(totalSar)} <small>ر.س</small></strong>
        </div>
        <a className="demo-primary demo-cart-continue" href="/menu/checkout/">
          متابعة الطلب <ArrowLeft size={19} />
        </a>
      </div>
      <p className="demo-fine-print">
        سلتك محفوظة على هذا المتصفح فقط. هذه تجربة عرض وليست طلبًا للفروع.
      </p>
    </section>
  );
}
