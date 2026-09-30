import type { AssetRoot } from "#src/models/genshinAssets/AssetRoot";

// A prefab a script spawns at run time, placed at an empty anchor of the scene: its root hangs from the anchor, and so
// Composes through the anchor's place, turn and scale as Unity composes a Transform
export interface AssetSpawn {
  anchor: AssetRoot;
  prefab: AssetRoot;
}
