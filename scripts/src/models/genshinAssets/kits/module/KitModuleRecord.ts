import type { KitRecord } from "genshin-world";

// A kit module's values as the record that would reproduce them, and each value its behaviour reads that the record
// Cannot hold, with why
export interface KitModuleRecord {
  record: KitRecord;
  unreadSites: string[];
}
