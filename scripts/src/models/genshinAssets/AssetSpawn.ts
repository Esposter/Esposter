import type { AssetRoot } from "#src/models/genshinAssets/AssetRoot";

// A prefab a script spawns at run time, placed at an empty anchor of the scene: its root hangs from the anchor, and so
// Composes through the anchor's place, turn and scale as Unity composes a Transform. Where a script also moves the root
// At run time, its local position under the anchor at the moment a reference shows, as measured from it, stands in for
// The prefab's own. Where the script lays the prefab out several times end to end and scrolls the row past the camera,
// Its copies are how many and the world step from one to the next, the row centred on the prefab's own place
export interface AssetSpawn {
  anchor: AssetRoot;
  copies?: { count: number; step: [number, number, number] };
  position?: [number, number, number];
  prefab: AssetRoot;
}
