import { Plus } from "lucide-react";
import { formatArabicNumber } from "@/data/brand";
import type { MenuProduct } from "@/data/menu";

export default function ProductCard({ product }: { product: MenuProduct }) {
  const startingPrice = Math.min(
    ...product.options.map(option => option.priceSar)
  );
  const hasOptions = product.options.length > 1;
  const detailUrl = `/menu/${product.slug}/`;
  const photoAlt = product.imageShared
    ? `صورة تصنيف ${product.categoryId === "kibbeh" ? "الكبة" : "فتة ورق العنب"} من القائمة؛ ليست تصويرًا مستقلًا لهذا الخيار`
    : `صورة ${product.name} مقتطعة من قائمة درة العنب`;

  return (
    <article
      className={`d-product-card ${product.slug === "mahshi" ? "d-product-wide" : ""}`}
      data-product={product.slug}
    >
      <a
        className="d-product-photo"
        href={detailUrl}
        aria-label={`تفاصيل ${product.name}`}
      >
        <img
          src={product.imageSrc}
          alt={photoAlt}
          width={product.imageWidth}
          height={product.imageHeight}
          loading="lazy"
          decoding="async"
        />
        {product.flavor && (
          <span
            className={`d-flavor ${product.flavor === "سبايسي" ? "is-spicy" : ""}`}
          >
            {product.flavor}
          </span>
        )}
      </a>
      <div className="d-card-body">
        <h3>
          <a href={detailUrl}>{product.name}</a>
        </h3>
        <p className="d-card-meta">
          {product.options[0].label}
          {hasOptions && product.slug !== "mahshi" ? " · أحجام إضافية" : ""}
        </p>
        {product.slug === "mahshi" ? (
          <div className="d-price-variants">
            {product.options.map(option => (
              <div key={option.id}>
                <span>{formatArabicNumber(option.pieces ?? 0)} حبات</span>
                <strong>
                  {formatArabicNumber(option.priceSar)} <small>ر.س</small>
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="d-card-price">
            {hasOptions && <span>من</span>}
            <strong>{formatArabicNumber(startingPrice)}</strong>
            <small>ر.س</small>
          </div>
        )}
        <a className="d-card-cta" href={detailUrl}>
          <span>{hasOptions ? "اختر حجم البوكس" : "التفاصيل"}</span>
          <Plus size={18} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
