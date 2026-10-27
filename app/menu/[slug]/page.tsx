import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenuProduct, menuProducts } from "@/data/menu";
import MenuShell from "@/components/menu/MenuShell";
import ProductDetails from "@/components/menu/ProductDetails";

export const dynamicParams = false;

export function generateStaticParams() {
  return menuProducts.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getMenuProduct(slug);
  if (!product) notFound();
  const title = `درة العنب | ${product.name} — الأحجام والأسعار`;
  const description = `خيارات ${product.name} وأسعارها المعتمدة في درة العنب. اختر الحجم والكمية وأضف إلى سلة العرض. الطلبات والمدفوعات تجريبية وليست تشغيلًا حقيقيًا.`;
  const logo =
    "https://files.manuscdn.com/user_upload_by_module/session_file/310519663747665183/kmzvJomPfsvkGzaX.png";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      locale: "ar_SA",
      type: "website",
      siteName: "درة العنب",
      images: [{ url: logo, alt: "شعار درة العنب" }],
    },
    twitter: { card: "summary", title, description, images: [logo] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getMenuProduct(slug);
  if (!product) notFound();
  return (
    <MenuShell detail>
      <ProductDetails product={product} />
    </MenuShell>
  );
}
