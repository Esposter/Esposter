import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";

// Every place the world sets one prefab down, in the game's own left-handed axes: each a position, a rotation as a
// Quaternion and a scale, as a root's own transform holds them
export interface WorldPrefabPlacements {
  places: {
    position: [number, number, number];
    rotation: [number, number, number, number];
    scale: [number, number, number];
  }[];
  prefab: AssetRoot;
}
