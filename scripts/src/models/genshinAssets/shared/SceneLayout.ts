import type { SceneDrawing } from "#src/models/genshinAssets/shared/SceneDrawing";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

// A scene read from its blocks' dumps: its objects, what each game object draws, and every object's name, each keyed by
// Its file and path ID
export interface SceneLayout {
  gameObjectDrawingMap: Map<string, SceneDrawing>;
  objectNameMap: Map<string, string>;
  objects: SceneObject[];
}
