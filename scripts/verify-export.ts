import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { brand, formatArabicNumber } from "../client/src/data/brand";
import { menuProducts } from "../client/src/data/menu";

for (const asset of new Set([
  ...Object.values(brand.assets),
  ...menuProducts.map(product => product.imageSrc),
])) {
  const file = join("out", asset);
  if (!(await stat(file)).isFile() || !(await readFile(file)).length)
    throw new Error(`Missing exported asset: ${asset}`);
}
const home = await readFile("out/index.html", "utf8");
for (const token of [
  "/_next/static/",
  "noindex",
  "viewport-fit=cover",
  "قائمة المنتجات المصوّرة",
  "mobile-bottom-nav",
]) {
  if (!home.includes(token))
    throw new Error(`Missing initial home HTML: ${token}`);
}
const expectedRoutes = [
  "/",
  "/menu/",
  "/menu/cart/",
  "/menu/checkout/",
  "/menu/tracking/",
  "/menu/branches/",
  ...menuProducts.map(product => `/menu/${product.slug}/`),
];
const manifest = JSON.parse(await readFile("out/manus-routes.json", "utf8"));
if (
  JSON.stringify(
    manifest.routes.map((route: { path: string }) => route.path).sort()
  ) !== JSON.stringify([...expectedRoutes].sort())
)
  throw new Error("Page manifest differs from the source-derived page routes");
for (const path of expectedRoutes) {
  const html = await readFile(join("out", path, "index.html"), "utf8");
  if (!html.includes("noindex") || !html.includes('lang="ar"'))
    throw new Error(`Missing Arabic preview metadata at ${path}`);
}
const menu = await readFile("out/menu/index.html", "utf8");
for (const product of menuProducts) {
  if (!menu.includes(product.name))
    throw new Error(`Missing initial menu product: ${product.name}`);
  const detail = await readFile(`out/menu/${product.slug}/index.html`, "utf8");
  if (
    !detail.includes(product.name) ||
    !detail.includes("الطلبات والمدفوعات تجريبية")
  )
    throw new Error(
      `Missing product detail or ordering restriction: ${product.slug}`
    );
  for (const option of product.options) {
    if (
      !detail.includes(option.label) ||
      !detail.includes(formatArabicNumber(option.priceSar))
    )
      throw new Error(
        `Missing approved option or price: ${product.slug}/${option.id}`
      );
  }
}
if (!(await readFile("out/404.html", "utf8")).includes("الصفحة غير موجودة"))
  throw new Error("Missing Arabic 404");
console.log(
  "Verified source-derived routes, menu products, approved prices, images, initial Arabic HTML and 404."
);
