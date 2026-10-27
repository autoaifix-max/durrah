"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import { brand } from "@/data/brand";
import ResponsivePhoto from "./ResponsivePhoto";

export default function MenuPhoto() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  const closeMenu = () => {
    dialog.current?.close();
    setOpened(false);
  };
  const openMenu = () => {
    setZoomed(false);
    setOpened(true);
    dialog.current?.showModal();
  };

  return (
    <div className="source-menu">
      <div className="source-menu-heading">
        <div>
          <span className="eyebrow">من قائمتنا الحقيقية</span>
          <h3>قائمة المنتجات المصوّرة</h3>
        </div>
        <button className="text-link" onClick={openMenu}>
          تكبير القائمة <Expand size={17} aria-hidden="true" />
        </button>
      </div>
      <button
        className="menu-photo-button"
        onClick={openMenu}
        aria-label="فتح صورة قائمة منتجات درة العنب وتكبير تفاصيلها"
      >
        <ResponsivePhoto
          asset="menu"
          alt="قائمة درة العنب المصوّرة: ورق عنب وملفوف كلاسيك وسبايسي، فتة ورق عنب، كبة دجاج ولحم ومحاشي"
          sizes="(max-width: 650px) calc(100vw - 40px), 1000px"
        />
        <span className="menu-zoom-label">
          <Expand size={16} aria-hidden="true" /> اضغط لعرض التفاصيل
        </span>
      </button>
      <p className="source-menu-note">
        صورة القائمة الأصلية التي أرفقها صاحب العلامة. الأسعار في البطاقات من
        مرجع المنتجات والأسعار المعتمد بتاريخ ١٦ أكتوبر ٢٠٢٦؛ الطلبات والمدفوعات
        في نسخة العرض تجريبية فقط.
      </p>
      <dialog
        ref={dialog}
        className="menu-dialog"
        aria-labelledby="menu-dialog-title"
        onClose={() => setOpened(false)}
        onCancel={() => setOpened(false)}
        onClick={event => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="menu-dialog-toolbar">
          <h3 id="menu-dialog-title">قائمة درة العنب المصوّرة</h3>
          <div className="menu-dialog-actions">
            <button
              className="zoom-button"
              onClick={() => setZoomed(!zoomed)}
              aria-pressed={zoomed}
            >
              {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              <span>{zoomed ? "عرض كامل" : "تكبير التفاصيل"}</span>
            </button>
            <button
              className="dialog-close"
              aria-label="إغلاق قائمة المنتجات"
              onClick={closeMenu}
            >
              <X size={22} />
            </button>
          </div>
        </div>
        <div
          className={`menu-dialog-scroll ${zoomed ? "is-zoomed" : ""}`}
          tabIndex={0}
          aria-label="صورة القائمة؛ عند التكبير يمكنك التمرير لقراءة كل التفاصيل"
        >
          {opened && (
            <img
              src={brand.assets.menuOriginal}
              alt="صورة قائمة درة العنب الأصلية كاملة دون تعديل محتواها"
              width="4160"
              height="3120"
            />
          )}
        </div>
        <div className="menu-dialog-footer">
          <p>
            الصورة المرجعية الأصلية — الأسعار معتمدة؛ الطلب والدفع محاكاة فقط.
          </p>
          <a
            className="text-link"
            href={brand.assets.menuOriginal}
            target="_blank"
            rel="noopener noreferrer"
          >
            افتح الأصل <ArrowUpLeft size={15} aria-hidden="true" />
          </a>
        </div>
      </dialog>
    </div>
  );
}
