import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

// A value a source gives for one path of a kit's record, and how it is known. A source that holds the field and gives
// None, as gcsim gives a physical hit no element, has the value undefined
export interface KitCandidate {
  provenance: KitValueSource;
  value: unknown;
}
