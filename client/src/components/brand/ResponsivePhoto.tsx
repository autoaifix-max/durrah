import { brand } from "@/data/brand";

const images = {
  opening: {
    fallback: brand.assets.storefrontOpening,
    width: 720,
    height: 1079,
  },
  day: { fallback: brand.assets.storefrontDay, width: 1198, height: 1600 },
  interior: { fallback: brand.assets.interior, width: 1440, height: 1920 },
  menu: { fallback: brand.assets.menu, width: 1920, height: 1440 },
} as const;

export default function ResponsivePhoto({
  asset,
  alt,
  sizes,
  className,
  eager = false,
}: {
  asset: keyof typeof images;
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  const image = images[asset];
  return (
    <picture
      className={
        className ? `responsive-photo ${className}` : "responsive-photo"
      }
    >
      <source
        type="image/webp"
        srcSet={`/brand/optimized/${asset}-480.webp 480w, /brand/optimized/${asset}-960.webp ${Math.min(960, image.width)}w`}
        sizes={sizes}
      />
      <img
        src={image.fallback}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
      />
    </picture>
  );
}
