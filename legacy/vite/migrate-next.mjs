import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";

const homePath = "client/src/pages/Home.tsx";
let home = readFileSync(homePath, "utf8");
if (!home.includes('import BranchDirectory')) {
  const start = home.indexOf('            <div className="branch-directory">');
  const end = home.indexOf('\n          </div>\n        </section>', start);
  if (start < 0 || end < 0) throw new Error("Branch directory bounds not found");
  const block = home.slice(start, end);
  writeFileSync("client/src/components/brand/BranchDirectory.tsx", `"use client";\nimport { useState } from "react";\nimport { ArrowUpLeft, Check, MapPin } from "lucide-react";\nimport { formatArabicNumber, type Branch } from "@/data/brand";\nimport { catalogProvider } from "@/services/catalog";\n\nexport default function BranchDirectory({ items = catalogProvider.getBranches() }: { items?: readonly Branch[] }) {\n  const [selectedBranchId, setSelectedBranchId] = useState(items[0]?.id ?? "");\n  const branches = items;\n  const branch = branches.find(item => item.id === selectedBranchId) ?? branches[0];\n  if (!branch) return <div className="branch-directory"><p>بيانات الفروع تُضاف بعد اعتمادها.</p></div>;\n  return (\n${block}\n  );\n}\n`);
  home = home.slice(0, start) + '            <BranchDirectory />' + home.slice(end);
  home = home.replace('import { useState } from "react";\n', "");
  home = home.replace(/  Check,\n|  MapPin,\n/g, "");
  home = home.replace('import CatalogMenu from "@/components/brand/CatalogMenu";', 'import CatalogMenu from "@/components/brand/CatalogMenu";\nimport BranchDirectory from "@/components/brand/BranchDirectory";\nimport MobileNav from "@/components/brand/MobileNav";');
  home = home.replace(/  const \[selectedBranchId[^;]+;\n  const branch =\n[^;]+;\n/, "");
  home = home.replace('formatArabicNumber(brand.branchCount)', 'formatArabicNumber(branches.length)');
  home = home.replace('درة العنب التي تجمع فروعنا التسعة', 'درة العنب التي تجمع فروعنا');
  home = home.replace('تسعة فروع.', '{formatArabicNumber(branches.length)} فروع.');
  home = home.replace('      </footer>\n', '      </footer>\n      <MobileNav />\n');
  writeFileSync(homePath, home);
}
for (const name of ["SiteHeader", "BranchGallery", "CatalogMenu", "MenuPhoto"]) {
  const path = `client/src/components/brand/${name}.tsx`;
  const source = readFileSync(path, "utf8");
  if (!source.startsWith('"use client"')) writeFileSync(path, '"use client";\n\n' + source);
}
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.scripts = {
  ...pkg.scripts,
  dev: "next dev --hostname 0.0.0.0 --port ${PORT:-3000}",
  "dev:static": "next dev --hostname 0.0.0.0 --port ${PORT:-3000}",
  build: "next build",
  "build:static": "next build",
  start: "node scripts/serve-preview.mjs",
  preview: "node scripts/serve-preview.mjs",
};
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
mkdirSync("legacy/vite", { recursive: true });
for (const [from, to] of [
  ["client/index.html", "legacy/vite/index.html"],
  ["client/src/main.tsx", "legacy/vite/main.tsx"],
  ["vite.config.ts", "legacy/vite/vite.config.ts"],
  ["scripts/prerender.tsx", "legacy/vite/prerender.tsx"],
  ["Dockerfile", "legacy/vite/Dockerfile"],
]) if (existsSync(from) && !existsSync(to)) renameSync(from, to);
console.log("Next.js migration applied. Prior entrypoints archived; all image sources preserved.");
