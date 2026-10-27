"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { brand, formatArabicNumber } from "@/data/brand";
import { useDemo } from "@/components/demo/DemoProvider";

type DemoView = "menu" | "cart" | "checkout" | "tracking" | "branches";
const viewTitles: Record<DemoView, string> = {
  menu: "قائمة الطعام",
  cart: "سلة طلبك",
  checkout: "إكمال الطلب",
  tracking: "متابعة الطلب",
  branches: "اختر فرعك",
};

export default function MenuShell({
  children,
  detail = false,
  view = "menu",
}: {
  children: ReactNode;
  detail?: boolean;
  view?: DemoView;
}) {
  const { totalQuantity } = useDemo();
  const backHref = view === "checkout" ? "/menu/cart/" : "/menu/";
  return (
    <div className={`d-menu d-menu-page ${detail ? "d-detail-page" : ""}`}>
      <a className="skip-link" href="#menu-main">
        انتقل إلى المحتوى
      </a>
      <header className="d-menu-header">
        <div className="d-menu-width">
          {detail || view !== "menu" ? (
            <a href={backHref} className="d-menu-back">
              <ArrowRight size={21} aria-hidden="true" />
              <span>{detail ? "تفاصيل المنتج" : viewTitles[view]}</span>
            </a>
          ) : (
            <a
              href="/"
              className="d-menu-brand"
              aria-label="درة العنب — الرئيسية"
            >
              <img
                src={brand.assets.logo}
                width="48"
                height="61"
                alt="شعار درة العنب"
              />
              <span>
                <strong>درة العنب</strong>
                <small>قائمة الطعام</small>
              </span>
            </a>
          )}
          <a
            className="d-bag-button demo-bag"
            href="/menu/cart/"
            aria-label={`السلة، ${formatArabicNumber(totalQuantity)} منتجات`}
          >
            <ShoppingBag size={22} aria-hidden="true" />
            {totalQuantity > 0 && (
              <span className="demo-bag-count">
                {formatArabicNumber(totalQuantity)}
              </span>
            )}
          </a>
        </div>
      </header>
      <main id="menu-main" className="d-menu-width">
        {children}
      </main>
      <nav className="d-menu-bottom-nav" aria-label="التنقل السريع للمنيو">
        <a
          href="/menu/"
          className={view === "menu" ? "active" : ""}
          aria-current={view === "menu" && !detail ? "page" : undefined}
        >
          <Utensils size={21} aria-hidden="true" />
          <span>القائمة</span>
        </a>
        <a
          href="/menu/branches/"
          className={view === "branches" ? "active" : ""}
          aria-current={view === "branches" ? "page" : undefined}
        >
          <MapPin size={21} aria-hidden="true" />
          <span>الفروع</span>
        </a>
        <a href="/#contact">
          <MessageCircle size={21} aria-hidden="true" />
          <span>تواصل</span>
        </a>
        <a
          href="/menu/cart/"
          className={view === "cart" || view === "checkout" ? "active" : ""}
          aria-current={view === "cart" ? "page" : undefined}
        >
          <ShoppingBag size={21} aria-hidden="true" />
          <span>
            السلة{" "}
            {totalQuantity > 0 ? `(${formatArabicNumber(totalQuantity)})` : ""}
          </span>
        </a>
      </nav>
    </div>
  );
}
