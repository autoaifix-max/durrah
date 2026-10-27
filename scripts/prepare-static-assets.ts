import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { brand } from "../client/src/data/brand";
import { menuProducts } from "../client/src/data/menu";

// The managed gateway resolves /manus-storage/. Matching exported files also
// make the same paths work with the local static preview or an offline export.
const localFiles: Record<keyof typeof brand.assets, string> = {
  logo: "logo.svg",
  storefrontDay: "storefront-day.jpg",
  storefrontOpening: "storefront-opening.jpg",
  menu: "menu-web.jpg",
  menuOriginal: "menu-original.jpg",
  interior: "interior-web.jpg",
  interiorOriginal: "interior-original.jpg",
};

await mkdir("public/manus-storage", { recursive: true });
for (const [key, localFile] of Object.entries(localFiles)) {
  const path = brand.assets[key as keyof typeof brand.assets];
  if (
    !path.startsWith("/manus-storage/") ||
    basename(path) !== path.split("/").at(-1)
  )
    throw new Error("Unexpected asset path");
  const source = join("public/brand", localFile);
  if (!(await readFile(source)).length)
    throw new Error(`Empty asset: ${source}`);
  await copyFile(source, join("public/manus-storage", basename(path)));
}
for (const asset of new Set(menuProducts.map(product => product.imageSrc))) {
  if (!asset.startsWith("/manus-storage/"))
    throw new Error("Unexpected product image route");
  const sourceName = basename(asset).replace(/_[0-9a-f]+(?=\.)/, "");
  const source = join("public/brand/products", sourceName);
  if (!(await readFile(source)).length)
    throw new Error(`Empty product image: ${source}`);
  await copyFile(source, join("public/manus-storage", basename(asset)));
}
const routes = [
  { path: "/", title: "درة العنب — الرئيسية" },
  { path: "/menu/", title: "درة العنب — قائمة الطعام" },
  { path: "/menu/cart/", title: "درة العنب — السلة التجريبية" },
  { path: "/menu/checkout/", title: "درة العنب — إكمال الطلب التجريبي" },
  { path: "/menu/tracking/", title: "درة العنب — تأكيد الطلب والتتبع" },
  { path: "/menu/branches/", title: "درة العنب — اختيار الفرع التجريبي" },
  ...menuProducts.map(product => ({
    path: `/menu/${product.slug}/`,
    title: `${product.name} — درة العنب`,
  })),
];
await writeFile(
  "public/manus-routes.json",
  JSON.stringify({ routes }, null, 2) + "\n"
);
console.log(
  "Prepared real-brand/product images and the source-derived Next.js page manifest."
);
