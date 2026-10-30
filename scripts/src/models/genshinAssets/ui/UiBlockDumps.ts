import type { DumpedGameObject } from "#src/models/genshinAssets/shared/DumpedGameObject";
import type { UiCanvasScaler } from "#src/models/genshinAssets/ui/UiCanvasScaler";
import type { UiRectTransformRead } from "#src/models/genshinAssets/ui/UiRectTransformRead";

// What a block's UI export holds, read a folder at a time.
// Its GameObjects, and its RectTransforms joined to their layouts.
// Its canvas scalers are keyed by their GameObject's path ID
export interface UiBlockDumps {
  canvases: Map<string, UiCanvasScaler>;
  gameObjects: DumpedGameObject[];
  rectTransforms: UiRectTransformRead[];
}
