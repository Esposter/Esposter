import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { AssetSpawn } from "#src/models/genshinAssets/shared/AssetSpawn";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

// What a component's exports are found by: the roots of the arrangements it is and the prefabs its scripts spawn into
// Them, which `extract` follows every pointer from, and the name pattern of the assets no pointer from them reaches.
// For a screen with an interface, the root of its RectTransforms and the pattern of an indexed asset beside them, which
// Finds their block (GameObjects are not in the asset index), and the name pattern of the animation clips it plays. For
// A screen with music, the Wwise id of the playlist that plays it. For a part of the open world, what the world places
// And the ground under it. And always the parity page's screen that draws it, which its references are judged on
export interface DerivedAssetComponentOptions {
  clipPattern?: string;
  // The component whose game model's rig its clips bind, for a component whose clips name bones its own roots do not
  // Hold: its avatar (`avatar`) names every bone's path, which is how the clips' paths resolve
  clipSkeleton?: DerivedAssetComponent;
  interface?: { anchorPattern: string; root: string };
  // A part of the open world whose world block is derived from its capital's place, or a sub-area's outline's centre
  // (`deriveCapitalWorld`), not set by hand
  isCapitalWorld?: boolean;
  musicPlaylistId?: number;
  namePattern?: string;
  // Absent when the component has no pointer root of its own. Weapons' roots are published by `weapon-roots` and read by
  // `readComponentRoots`, so its entry leaves them out as well
  roots?: AssetRoot[];
  screen: string;
  spawns?: AssetSpawn[];
  world?: WorldOptions;
}
