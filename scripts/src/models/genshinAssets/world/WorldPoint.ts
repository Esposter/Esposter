import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";

// A prefab the world places where one of its scene points stands, as a gadget's prefab stands at its point: the point
// File of the community's dump, relative to its folder, the point's category and id within it, and the fields of the
// Point holding its position and its Euler rotation in degrees, all named as that dump obfuscates them, so a dump that
// Renames them is caught rather than misread
export interface WorldPoint {
  category: string;
  file: string;
  id: string;
  position: string;
  prefab: AssetRoot;
  rotation: string;
}
