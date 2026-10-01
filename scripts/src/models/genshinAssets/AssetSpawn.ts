import type { AssetRoot } from "#src/models/genshinAssets/AssetRoot";

// A prefab a script spawns at run time, placed at an empty anchor of the scene: its root hangs from the anchor, and so
// Composes through the anchor's place, turn and scale as Unity composes a Transform. Where a script also moves the root
// At run time, its local position under the anchor at the moment a reference shows, as measured from it, stands in for
// The prefab's own
export interface AssetSpawn {
  anchor: AssetRoot;
  position?: [number, number, number];
  prefab: AssetRoot;
}
