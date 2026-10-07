import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { AssetSpawn } from "#src/models/genshinAssets/shared/AssetSpawn";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

// What a component's exports are found by: the roots of the arrangements it is and the prefabs its scripts spawn into
// Them, which `extract` follows every pointer from, and the name pattern of the assets no pointer from them reaches.
// For a screen with an interface, the root of its RectTransforms and the pattern of an indexed asset beside them, which
// Finds their block (GameObjects are not in the asset index), and the name pattern of the animation clips it plays. For
// A screen with music, the Wwise id of the playlist that plays it. For a part of the open world, what the world places
// And the ground under it. And always the parity page's screen that draws it, which its references are judged on
export interface DerivedAssetComponentOptions {
  clipPattern?: string;
  interface?: { anchorPattern: string; root: string };
  musicPlaylistId?: number;
  namePattern?: string;
  roots: AssetRoot[];
  screen: string;
  spawns?: AssetSpawn[];
  world?: WorldOptions;
}
