import type { SceneObject } from "#src/models/genshinAssets/SceneObject";
import type { SceneTreeFlag } from "#src/models/genshinAssets/SceneTreeFlag";

// One node of a scene's tree: its object, the mesh it draws (empty for none), its scale composed through every father
// The dumps hold, what its arrangement flags, and the children the dumps hold, found by the father each names
export interface SceneTreeNode {
  children: SceneTreeNode[];
  flags: SceneTreeFlag[];
  mesh: string;
  object: SceneObject;
  worldScale: [number, number, number];
}
