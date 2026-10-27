"use client";

import { useId, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Search, X } from "lucide-react";
import { formatArabicNumber } from "@/data/brand";
import { filterMenuProducts, MENU_CATEGORIES } from "@/data/menu";
import ProductCard from "./ProductCard";
import { useDemo } from "@/components/demo/DemoProvider";
import { demoBranches } from "@/data/demo";

export default function MenuCatalog({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { branchId } = useDemo();
  const selectedBranch = demoBranches.find(branch => branch.id === branchId);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const inputId = useId();
  const results = useMemo(
    () => filterMenuProducts(query, category),
    [query, category]
  );
  const title =
    category === "all"
      ? "كل أصنافنا"
      : (MENU_CATEGORIES.find(item => item.id === category)?.name ?? "أصنافنا");
  const clear = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <div className="d-menu-catalog">
      <div className="d-catalog-intro">
        <span className="d-menu-eyebrow">
          الأسعار المعتمدة · بالريال السعودي
        </span>
        {embedded ? <h2>قائمة الطعام</h2> : <h1>قائمة الطعام</h1>}
        <p>اختر صنفك، ثم حدّد حجم البوكس المناسب لك.</p>
        {embedded && (
          <a className="d-menu-open-link" href="/menu/">
            افتح قائمة الطعام <ArrowLeft size={17} aria-hidden="true" />
          </a>
        )}
      </div>
      <a className="d-branch-banner" href="/menu/branches/">
        <MapPin size={23} aria-hidden="true" />
        <span>
          <strong>{selectedBranch?.label ?? "اختر فرعك"}</strong>
          <small>
            {selectedBranch
              ? "تغيير الفرع في تجربة العرض"
              : "اختر فرعًا لتجربة الطلب"}
          </small>
        </span>
        <ArrowLeft size={19} className="d-next" aria-hidden="true" />
      </a>
      <div className="d-search">
        <Search size={19} aria-hidden="true" />
        <label className="sr-only" htmlFor={inputId}>
          ابحث عن صنفك
        </label>
        <input
          id={inputId}
          type="search"
          placeholder="ابحث عن صنفك"
          value={query}
          onChange={event => setQuery(event.target.value)}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="مسح البحث"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div
        className="d-category-tabs"
        role="group"
        aria-label="تصنيفات قائمة الطعام"
      >
        <button
          type="button"
          aria-pressed={category === "all"}
          className={category === "all" ? "active" : ""}
          onClick={() => setCategory("all")}
        >
          الكل
        </button>
        {MENU_CATEGORIES.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            className={category === item.id ? "active" : ""}
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="d-results-heading">
        <h2>{title}</h2>
        <span role="status" aria-live="polite">
          {formatArabicNumber(results.length)} خيارات
        </span>
      </div>
      {results.length ? (
        <div className="d-products-grid">
          {results.map(product => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
      ) : (
        <div className="d-empty-results">
          <h3>لم نجد صنفًا بهذا الاسم</h3>
          <p>جرّب اسمًا آخر، أو عد إلى جميع الأصناف.</p>
          <button type="button" className="d-reset" onClick={clear}>
            عرض جميع الأصناف
          </button>
        </div>
      )}
      <div className="d-menu-range-note">
        <strong>أحجام ورق العنب والملفوف</strong>
        <p>
          ١٠، ٢٠، ٣٠، ٤٠، ٥٠، ٦٠ أو ٧٠ حبة؛ سعر البوكس من ١٠ إلى ٧٠ ر.س. السعر
          المحدّد يظهر عند اختيار الحجم.
        </p>
      </div>
      <div className="d-menu-footnote">
        <p>
          الصور مقتطعة من قائمتك الأصلية، وليست تصويرًا جديدًا. صور الفتة والكبة
          مشتركة للتصنيف.
        </p>
        <p>
          مرجع الأسعار: اعتماد ١٦ أكتوبر ٢٠٢٦. التوافر يُحدَّد حسب الفرع، ورسوم
          التوصيل ووضع الضريبة غير مؤكدين هنا.
        </p>
        <p>
          <strong>
            نسخة عرض — الطلبات والمدفوعات تجريبية ولا تُرسل إلى الفروع.
          </strong>
        </p>
      </div>
    </div>
  );
}
