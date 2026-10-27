import {
  brand,
  branches,
  categories,
  type Branch,
  type ProductCategory,
} from "@/data/brand";

/** Replace this read-only provider after approving Odoo/Foodics integration.
 * Credentials, webhooks, retries and provider adapters must live on a future server,
 * never in the public frontend. No external requests are made by this provider.
 */
export interface CatalogProvider {
  readonly source: "local" | "odoo" | "foodics";
  getCategories(): readonly ProductCategory[];
  getBranches(): readonly Branch[];
}

export const catalogProvider: CatalogProvider = {
  source: "local",
  getCategories: () => categories,
  getBranches: () => branches,
};

/** Direct chat can only be enabled after an approved number and mode are set.
 * This is not WhatsApp Business API integration and does not send messages.
 */
export function getWhatsAppUrl(): string | null {
  if (
    !brand.contact.whatsappEnabled ||
    brand.integrations.whatsappMode !== "direct"
  )
    return null;
  const phone = brand.contact.whatsappPhone;
  if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone)) return null;
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}
