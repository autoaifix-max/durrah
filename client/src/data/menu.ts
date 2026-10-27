export interface MenuOption {
  id: string;
  label: string;
  pieces: number | null;
  priceSar: number;
}

export interface MenuProduct {
  slug: string;
  categoryId: string;
  name: string;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  imageShared: boolean;
  flavor: "كلاسيك" | "سبايسي" | null;
  options: readonly MenuOption[];
  externalId: null;
}

export const MENU_CATEGORIES = [
  { id: "grape-leaves", name: "ورق عنب" },
  { id: "cabbage", name: "ملفوف" },
  { id: "fatteh", name: "فتة" },
  { id: "kibbeh", name: "كبة" },
  { id: "mahshi", name: "محاشي" },
] as const;

export const PRICE_APPROVAL = {
  date: "2026-10-16",
  currency: "SAR",
  source: "DA-PRICE-001",
  taxStatus: "unconfirmed",
} as const;

const arabicIndicInteger = new Intl.NumberFormat("ar-SA", {
  numberingSystem: "arab",
  useGrouping: false,
  maximumFractionDigits: 0,
});

function boxLabel(pieces: number): string {
  const unit = pieces <= 10 ? "حبات" : "حبة";
  return `بوكس ${arabicIndicInteger.format(pieces)} ${unit}`;
}

const grapeAndCabbageOptions: readonly MenuOption[] = [
  10, 20, 30, 40, 50, 60, 70,
].map(pieces => ({
  id: `pack-${pieces}`,
  label: boxLabel(pieces),
  pieces,
  priceSar: pieces,
}));

export const menuProducts: readonly MenuProduct[] = [
  {
    slug: "grape-classic",
    categoryId: "grape-leaves",
    name: "ورق عنب كلاسيك",
    imageSrc: "/manus-storage/grape-classic_eb5de6a3.webp",
    imageWidth: 700,
    imageHeight: 457,
    imageShared: false,
    flavor: "كلاسيك",
    options: grapeAndCabbageOptions,
    externalId: null,
  },
  {
    slug: "grape-spicy",
    categoryId: "grape-leaves",
    name: "ورق عنب سبايسي",
    imageSrc: "/manus-storage/grape-spicy_be16ad7a.webp",
    imageWidth: 711,
    imageHeight: 442,
    imageShared: false,
    flavor: "سبايسي",
    options: grapeAndCabbageOptions,
    externalId: null,
  },
  {
    slug: "cabbage-classic",
    categoryId: "cabbage",
    name: "ملفوف كلاسيك",
    imageSrc: "/manus-storage/cabbage-classic_7ec628a4.webp",
    imageWidth: 683,
    imageHeight: 452,
    imageShared: false,
    flavor: "كلاسيك",
    options: grapeAndCabbageOptions,
    externalId: null,
  },
  {
    slug: "cabbage-spicy",
    categoryId: "cabbage",
    name: "ملفوف سبايسي",
    imageSrc: "/manus-storage/cabbage-spicy_2b4d6669.webp",
    imageWidth: 696,
    imageHeight: 448,
    imageShared: false,
    flavor: "سبايسي",
    options: grapeAndCabbageOptions,
    externalId: null,
  },
  {
    slug: "fatteh",
    categoryId: "fatteh",
    name: "فتة ورق عنب",
    imageSrc: "/manus-storage/fatteh_e0c2341d.webp",
    imageWidth: 667,
    imageHeight: 296,
    imageShared: true,
    flavor: null,
    options: [
      { id: "standard", label: "السعر المعتمد", pieces: null, priceSar: 10 },
    ],
    externalId: null,
  },
  {
    slug: "fatteh-large",
    categoryId: "fatteh",
    name: "فتة ورق عنب كبير",
    imageSrc: "/manus-storage/fatteh_e0c2341d.webp",
    imageWidth: 667,
    imageHeight: 296,
    imageShared: true,
    flavor: null,
    options: [
      { id: "large", label: "الخيار الكبير", pieces: null, priceSar: 15 },
    ],
    externalId: null,
  },
  {
    slug: "kibbeh-chicken",
    categoryId: "kibbeh",
    name: "كبة دجاج",
    imageSrc: "/manus-storage/kibbeh_06193f48.webp",
    imageWidth: 705,
    imageHeight: 443,
    imageShared: true,
    flavor: null,
    options: [{ id: "pack-5", label: boxLabel(5), pieces: 5, priceSar: 10 }],
    externalId: null,
  },
  {
    slug: "kibbeh-meat",
    categoryId: "kibbeh",
    name: "كبة لحم",
    imageSrc: "/manus-storage/kibbeh_06193f48.webp",
    imageWidth: 705,
    imageHeight: 443,
    imageShared: true,
    flavor: null,
    options: [{ id: "pack-5", label: boxLabel(5), pieces: 5, priceSar: 10 }],
    externalId: null,
  },
  {
    slug: "mahshi",
    categoryId: "mahshi",
    name: "محاشي مشكلة",
    imageSrc: "/manus-storage/mahshi_43b6c4a2.webp",
    imageWidth: 684,
    imageHeight: 347,
    imageShared: false,
    flavor: null,
    options: [
      { id: "pack-5", label: boxLabel(5), pieces: 5, priceSar: 10 },
      { id: "pack-10", label: boxLabel(10), pieces: 10, priceSar: 20 },
    ],
    externalId: null,
  },
] as const;

function normalizeArabic(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, "")
    .replace(/[ـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function getMenuProduct(slug: string): MenuProduct | undefined {
  return menuProducts.find(product => product.slug === slug);
}

export function filterMenuProducts(
  query: string,
  categoryId: string = "all"
): readonly MenuProduct[] {
  const normalizedQuery = normalizeArabic(query);

  return menuProducts.filter(product => {
    const belongsToCategory =
      categoryId === "all" || product.categoryId === categoryId;
    return (
      belongsToCategory &&
      normalizeArabic(product.name).includes(normalizedQuery)
    );
  });
}

export function calculateProductTotal(
  product: MenuProduct,
  optionId: string,
  boxCount: number
): number {
  if (!Number.isSafeInteger(boxCount) || boxCount < 1) {
    throw new RangeError("boxCount must be a positive safe integer.");
  }

  const option = product.options.find(candidate => candidate.id === optionId);
  if (!option) {
    throw new RangeError("A valid product option is required.");
  }

  if (!Number.isFinite(option.priceSar) || option.priceSar <= 0) {
    throw new RangeError("Option price must be a positive finite value.");
  }

  const total = option.priceSar * boxCount;
  if (!Number.isFinite(total) || !Number.isSafeInteger(total) || total <= 0) {
    throw new RangeError("Calculated total must be a positive safe value.");
  }

  return total;
}
