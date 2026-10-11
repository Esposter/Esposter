import type { KitBag } from "#src/models/genshinAssets/kits/module/KitBag";

// A value a kit module's site gives its record: the field it goes in, the name it goes by, and its value
export interface KitBagEntry {
  bag: KitBag;
  name: string;
  value: unknown;
}
