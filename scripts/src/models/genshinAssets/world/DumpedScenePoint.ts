import type { DumpedVector } from "#src/models/genshinAssets/world/DumpedVector";

// A scene point as the community's dump writes one: its kind, and every other field by the name the dump obfuscates it
// To, of which a fit reads only numbers and vectors
export interface DumpedScenePoint {
  $type: string;
  [field: string]: DumpedVector | number | string;
}
