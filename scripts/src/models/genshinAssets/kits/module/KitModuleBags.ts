import type { KitBag } from "#src/models/genshinAssets/kits/module/KitBag";
import type { KitRecord } from "genshin-world";

// The values a kit module's behaviour reads that its record holds by name, and each site whose value it cannot hold,
// With why
export interface KitModuleBags {
  bags: Pick<KitRecord, `${KitBag}`>;
  unreadSites: string[];
}
