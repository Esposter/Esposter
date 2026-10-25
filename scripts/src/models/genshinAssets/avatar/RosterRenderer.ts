import type { SkinnedRenderer } from "#src/models/genshinAssets/avatar/SkinnedRenderer";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

// A skinned renderer whose mesh resolves, with the name the asset index gives that mesh and the scene object its game
// Object is
export interface RosterRenderer extends SkinnedRenderer {
  mesh: ResolvedObject;
  name: string;
  object?: SceneObject;
}
