import type { AssetParent } from "#src/models/genshinAssets/AssetParent";
import type { AssetRoot } from "#src/models/genshinAssets/AssetRoot";

// What a component's exports are found by: the roots of the arrangements it is, which `extract` follows every pointer
// From, and the name pattern of the assets no pointer from them reaches. For a screen with an interface, the root of its
// RectTransforms and the pattern of an indexed asset beside them, which finds their block (GameObjects are not in the
// Asset index), the name pattern of the animation clips it plays, and the parent of a root whose own parent sits in a
// Block not read, so it is dumped at the origin at its own scale though the game places and scales it by that parent,
// Solved from something it must meet
export interface DerivedAssetComponentOptions {
  clipPattern?: string;
  interface?: { anchorPattern: string; root: string };
  namePattern?: string;
  rootParents?: Record<string, AssetParent>;
  roots: AssetRoot[];
}
