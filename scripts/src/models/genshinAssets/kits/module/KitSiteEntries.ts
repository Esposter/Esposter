import type { KitBagEntry } from "#src/models/genshinAssets/kits/module/KitBagEntry";

// What one site of a kit module gives its record: its entries, whether its value is a table's parameter, which decides
// Whether the reads a binding is derived from stand in its place, and why its value cannot be held, if it cannot
export interface KitSiteEntries {
  entries: KitBagEntry[];
  isParameter: boolean;
  unreadReason?: string;
}
