export interface ProductVariant {
  name: string;
  packLabel: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  english: string;
  number: string;
  note: string;
  variants: ProductVariant[];
  externalId: string | null;
}

export interface Branch {
  id: string;
  ordinal: number;
  name: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  hours: string | null;
  mapsUrl: string | null;
  externalId: string | null;
}

export const brand = {
  name: "درة العنب",
  tagline: "طازج يومياً",
  branchCount: 9,
  copyrightYear: 2026,
  assets: {
    logo: "/manus-storage/logo_4b0c98f3.svg",
    storefrontDay: "/manus-storage/storefront-day_9f52801d.jpg",
    storefrontOpening: "/manus-storage/storefront-opening_8b83300d.jpg",
    menu: "/manus-storage/menu-web_452dc92e.jpg",
    menuOriginal: "/manus-storage/menu-original_552e1ba1.jpg",
    interior: "/manus-storage/interior-web_e0f5af09.jpg",
    interiorOriginal: "/manus-storage/interior-original_b0368daa.jpg",
  },
  contact: {
    whatsappPhone: null as string | null,
    phone: null as string | null,
    email: null as string | null,
    whatsappEnabled: false,
  },
  integrations: {
    catalogProvider: "local" as "local" | "odoo" | "foodics",
    whatsappMode: "not-configured" as
      | "not-configured"
      | "direct"
      | "business-api",
    orderingEnabled: false,
    paymentsEnabled: false,
  },
};

// Names and pack sizes transcribed from IMG_20261014_221538.jpg.
// Photo prices are not converted into current digital prices in this stage.
const leafPackLabel = "بوكسات ١٠، ٢٠، ٣٠، ٤٠، ٥٠، ٦٠ أو ٧٠ حبة";
export const categories: ProductCategory[] = [
  {
    id: "grape-leaves",
    name: "ورق عنب",
    english: "GRAPE LEAVES",
    number: "01",
    note: "كلاسيك أو سبايسي، كما تظهر في قائمتنا المصوّرة.",
    variants: [
      { name: "ورق عنب كلاسيك", packLabel: leafPackLabel },
      { name: "ورق عنب سبايسي", packLabel: leafPackLabel },
    ],
    externalId: null,
  },
  {
    id: "cabbage",
    name: "ملفوف",
    english: "CABBAGE",
    number: "02",
    note: "خيارات الملفوف من القائمة المرفقة.",
    variants: [
      { name: "ملفوف كلاسيك", packLabel: leafPackLabel },
      { name: "ملفوف سبايسي", packLabel: leafPackLabel },
    ],
    externalId: null,
  },
  {
    id: "fatteh",
    name: "فتة ورق عنب",
    english: "GRAPE LEAVES FATTEH",
    number: "03",
    note: "فتة ورق العنب، بحجميها الظاهرين في القائمة.",
    variants: [
      { name: "فتة ورق عنب", packLabel: "" },
      { name: "فتة ورق عنب كبير", packLabel: "" },
    ],
    externalId: null,
  },
  {
    id: "kibbeh",
    name: "كبة",
    english: "KIBBEH",
    number: "04",
    note: "كبة دجاج وكبة لحم، كما وردتا في القائمة.",
    variants: [
      { name: "كبة دجاج", packLabel: "بوكس ٥ حبات" },
      { name: "كبة لحم", packLabel: "بوكس ٥ حبات" },
    ],
    externalId: null,
  },
  {
    id: "mahshi",
    name: "محاشي",
    english: "MAHSHI",
    number: "05",
    note: "بوكسات المحاشي المشكلة من القائمة المرفقة.",
    variants: [{ name: "محاشي مشكلة", packLabel: "بوكس ٥ حبات أو ١٠ حبات" }],
    externalId: null,
  },
];

// Ordinals represent incomplete records, not official branch names or locations.
export const branches: Branch[] = Array.from(
  { length: brand.branchCount },
  (_, index) => ({
    id: `branch-record-${index + 1}`,
    ordinal: index + 1,
    name: null,
    address: null,
    city: null,
    phone: null,
    hours: null,
    mapsUrl: null,
    externalId: null,
  })
);

export function formatArabicNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA", { useGrouping: false }).format(value);
}
