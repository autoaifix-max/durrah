import MenuCatalog from "@/components/menu/MenuCatalog";
import MenuPhoto from "./MenuPhoto";

export default function CatalogMenu() {
  return (
    <section
      id="menu"
      className="d-menu d-menu-embedded"
      aria-label="قائمة الطعام المصورة والأسعار المعتمدة"
    >
      <MenuCatalog embedded />
      <div className="page-width">
        <MenuPhoto />
      </div>
    </section>
  );
}
