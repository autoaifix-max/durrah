import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../App";
import { brand, branches, categories, formatArabicNumber } from "./brand";
import { catalogProvider, getWhatsAppUrl } from "../services/catalog";
import { DemoProvider } from "../components/demo/DemoProvider";

describe("approved brand content", () => {
  it("contains the five category groups verified in the supplied menu", () => {
    expect(categories.map(item => item.name)).toEqual([
      "ورق عنب",
      "ملفوف",
      "فتة ورق عنب",
      "كبة",
      "محاشي",
    ]);
    expect(categories.every(item => item.externalId === null)).toBe(true);
    expect(
      categories.flatMap(item => item.variants).map(item => item.name)
    ).toEqual([
      "ورق عنب كلاسيك",
      "ورق عنب سبايسي",
      "ملفوف كلاسيك",
      "ملفوف سبايسي",
      "فتة ورق عنب",
      "فتة ورق عنب كبير",
      "كبة دجاج",
      "كبة لحم",
      "محاشي مشكلة",
    ]);
  });
  it("keeps category-group records separate from the approved per-option menu prices", () => {
    for (const item of categories) {
      expect(item).not.toHaveProperty("price");
      for (const variant of item.variants)
        expect(variant).not.toHaveProperty("price");
    }
  });
  it("has twelve branch records with editable city assignments and no fictional contacts", () => {
    expect(branches).toHaveLength(12);
    expect(new Set(branches.map(item => item.id)).size).toBe(12);
    expect(Object.fromEntries([...new Set(branches.map(item => item.city))].map(city => [city, branches.filter(item => item.city === city).length]))).toEqual({ "عنيزة": 2, "بريدة": 2, "حائل": 3, "الرس": 2, "الرياض": 1, "حفر الباطن": 2 });
    expect(
      branches.every(
        item =>
          item.name === null &&
          item.address === null &&
          item.city !== null &&
          item.phone === null &&
          item.hours === null &&
          item.mapsUrl === null
      )
    ).toBe(true);
  });
  it("does not activate ordering, payments, WhatsApp or external providers", () => {
    expect(catalogProvider.source).toBe("local");
    expect(brand.integrations.orderingEnabled).toBe(false);
    expect(brand.integrations.paymentsEnabled).toBe(false);
    expect(brand.integrations.whatsappMode).toBe("not-configured");
    expect(brand.contact.phone).toBeNull();
    expect(brand.contact.whatsappPhone).toBeNull();
    expect(getWhatsAppUrl()).toBeNull();
  });
  it("rejects unapproved or invalid direct-chat configuration", () => {
    const original = { ...brand.contact };
    const mode = brand.integrations.whatsappMode;
    try {
      brand.contact.whatsappEnabled = true;
      brand.integrations.whatsappMode = "direct";
      brand.contact.whatsappPhone = "invalid-phone";
      expect(getWhatsAppUrl()).toBeNull();
      brand.contact.whatsappPhone = null;
      expect(getWhatsAppUrl()).toBeNull();
    } finally {
      Object.assign(brand.contact, original);
      brand.integrations.whatsappMode = mode;
    }
  });
  it("provides only project-owned real images and full-resolution sources", () => {
    expect(
      Object.values(brand.assets).every(path =>
        path.startsWith("/manus-storage/")
      )
    ).toBe(true);
    expect(Object.keys(brand.assets)).toHaveLength(7);
    expect(brand.assets.menuOriginal).not.toBe(brand.assets.menu);
    expect(brand.assets.interiorOriginal).not.toBe(brand.assets.interior);
  });
  it("formats branch ordinals in Arabic", () => {
    expect(formatArabicNumber(12)).toBe("١٢");
  });
});

describe("static homepage", () => {
  it("renders all sections and approved text without browser APIs", () => {
    const html = renderToStaticMarkup(
      <DemoProvider>
        <App />
      </DemoProvider>
    );
    for (const id of ["home", "menu", "about", "branches", "contact"])
      expect(html).toContain(`id="${id}"`);
    for (const item of categories) expect(html).toContain(item.name);
    expect(html).toContain("طازج يومياً");
    expect(html).toContain("بانتظار البيانات");
    expect(html).toContain("صورة حقيقية");
    expect(html).not.toContain("wa.me/");
    expect(html).not.toContain("<form");
    expect(html).toContain("disabled");
    expect(html).toContain('aria-pressed="true"');
  });
  it("includes the supplied menu and interior with source-context labels", () => {
    const html = renderToStaticMarkup(
      <DemoProvider>
        <App />
      </DemoProvider>
    );
    expect(html).toContain(brand.assets.menu);
    expect(html).toContain(brand.assets.menuOriginal);
    expect(html).toContain(brand.assets.interior);
    expect(html).toContain("قائمة المنتجات المصوّرة");
    expect(html).toContain("داخل أحد فروعنا");
    expect(html).toContain("اعتماد ١٦ أكتوبر ٢٠٢٦");
    expect(html).toContain("تكبير التفاصيل");
    expect(html).not.toContain("ضماننا الذهبي");
    expect(html).not.toContain("إرجاع مجاني");
  });
});
