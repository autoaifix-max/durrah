import { describe, expect, it } from "vitest";
import {
  calculateProductTotal,
  filterMenuProducts,
  getMenuProduct,
  menuProducts,
  PRICE_APPROVAL,
} from "./menu";

describe("approved menu data", () => {
  it("keeps the approved source, products, and all 34 options", () => {
    expect(PRICE_APPROVAL).toEqual({
      date: "2026-10-16",
      currency: "SAR",
      source: "DA-PRICE-001",
      taxStatus: "unconfirmed",
    });
    expect(menuProducts).toHaveLength(9);
    expect(menuProducts.map(product => product.name)).toEqual([
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
    expect(
      menuProducts.reduce((total, product) => total + product.options.length, 0)
    ).toBe(34);
  });

  it("uses Arabic-Indic numerals in approved box labels", () => {
    expect(getMenuProduct("grape-classic")?.options[0].label).toBe(
      "بوكس ١٠ حبات"
    );
    expect(getMenuProduct("mahshi")?.options[1].label).toBe("بوكس ١٠ حبات");
  });
});

describe("local product calculations", () => {
  it("calculates a three-box total without tax or fees", () => {
    const product = getMenuProduct("grape-classic");
    expect(product).toBeDefined();
    expect(calculateProductTotal(product!, "pack-10", 3)).toBe(30);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid box count %p",
    boxCount => {
      expect(() =>
        calculateProductTotal(menuProducts[0], "pack-10", boxCount)
      ).toThrow(RangeError);
    }
  );

  it("rejects unknown options and totals that are not safely representable", () => {
    expect(() =>
      calculateProductTotal(menuProducts[0], "not-an-option", 1)
    ).toThrow(RangeError);
    expect(() =>
      calculateProductTotal(menuProducts[0], "pack-10", Number.MAX_SAFE_INTEGER)
    ).toThrow(RangeError);
  });
});

describe("menu lookup and filtering", () => {
  it("finds Arabic queries after removing diacritics", () => {
    expect(
      filterMenuProducts("وَرَق عِنَب", "grape-leaves").map(
        product => product.slug
      )
    ).toEqual(["grape-classic", "grape-spicy"]);
    expect(
      filterMenuProducts("كبة", "kibbeh").map(product => product.slug)
    ).toEqual(["kibbeh-chicken", "kibbeh-meat"]);
  });

  it("returns no records for an unknown product or category", () => {
    expect(getMenuProduct("unknown-product")).toBeUndefined();
    expect(filterMenuProducts("منتج غير موجود")).toEqual([]);
    expect(filterMenuProducts("", "unknown-category")).toEqual([]);
  });
});
