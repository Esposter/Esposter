import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

// A renderer's bone as the layout names it: its path from the renderer's root bone down, and its scene object
export interface RendererBone {
  object: SceneObject;
  path: string;
}
