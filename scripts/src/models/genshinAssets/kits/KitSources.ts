import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

// A character's entry of the `kitSources` index: the gcsim tag its gcsim values are read at, and how each value of its
// Record is known, by the value's path in the record
export interface KitSources {
  gcsimTag: string;
  values: Record<string, KitValueSource>;
}
