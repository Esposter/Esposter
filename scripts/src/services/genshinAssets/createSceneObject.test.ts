import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { describe } from "vitest";

// A scene object at the identity, named and drawn by its transform's path ID, its parent in its own file, with what a
// Case sets over it
export const createSceneObject = (
  transformId: string,
  parentId: string,
  overrides: Partial<SceneObject> = {},
): SceneObject => ({
  block: "",
  childIds: [],
  components: [],
  file: "",
  gameObjectId: transformId,
  name: transformId,
  parentFile: overrides.file ?? "",
  parentId,
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
  transformId,
  ...overrides,
});

describe.todo("createSceneObject");
