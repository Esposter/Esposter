import type { KitSources } from "#src/models/genshinAssets/kits/KitSources";
import type { KitRecord } from "genshin-world";

// One kit as the builder publishes it: its record, and how each of the record's values is known
export interface BuiltKit {
  record: KitRecord;
  sources: KitSources;
}
