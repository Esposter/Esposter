import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { ScenePointExemplar } from "#src/models/genshinAssets/world/ScenePointExemplar";

// A prefab the world places where one of its scene points stands, as a gadget's prefab stands at its point
export interface WorldPoint extends ScenePointExemplar {
  prefab: AssetRoot;
}
