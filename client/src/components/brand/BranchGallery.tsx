"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { brand } from "@/data/brand";
import ResponsivePhoto from "./ResponsivePhoto";

const gallery = [
  {
    asset: "day" as const,
    src: brand.assets.storefrontDay,
    alt: "واجهة درة العنب النهارية بلوحتها الخضراء واسم العلامة الأبيض",
    title: "واجهة تحمل هويتنا",
    subtitle: "صورة حقيقية من المواد المرفقة",
  },
  {
    asset: "opening" as const,
    src: brand.assets.storefrontOpening,
    alt: "صورة افتتاح درة العنب ليلاً بالواجهة الخضراء وزينة الافتتاح",
    title: "لحظة من الافتتاح",
    subtitle: "صورة حقيقية من المواد المرفقة",
  },
];

export default function BranchGallery() {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const image = gallery[index];

  return (
    <div className="branch-gallery">
      <div className="gallery-photo-frame">
        <ResponsivePhoto
          className="gallery-photo"
          asset={image.asset}
          alt={image.alt}
          sizes="(max-width: 650px) calc(100vw - 40px), 540px"
        />
        <span className="real-photo-label">
          <span /> صورة حقيقية
        </span>
        <button
          className="expand-image"
          onClick={() => dialog.current?.showModal()}
          aria-label="عرض صورة الواجهة كاملة"
        >
          <Expand size={19} />
        </button>
      </div>
      <div className="gallery-caption">
        <div aria-live="polite">
          <strong>{image.title}</strong>
          <p>{image.subtitle}</p>
        </div>
        <div className="gallery-controls">
          <button
            aria-label="الصورة السابقة"
            onClick={() =>
              setIndex((index + gallery.length - 1) % gallery.length)
            }
          >
            <ArrowRight size={18} />
          </button>
          <span className="gallery-counter" dir="ltr">
            {index + 1} / {gallery.length}
          </span>
          <button
            aria-label="الصورة التالية"
            onClick={() => setIndex((index + 1) % gallery.length)}
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-label={image.title}
        onClick={event => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="dialog-close"
          aria-label="إغلاق الصورة"
          onClick={() => dialog.current?.close()}
        >
          <X size={22} />
        </button>
        <img src={image.src} alt={image.alt} />
        <p>{image.subtitle} — لا تمثل تصويرًا منفصلًا للفروع التسعة.</p>
      </dialog>
    </div>
  );
}
