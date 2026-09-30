import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { describe } from "vitest";

// A scene object at the identity, named and drawn by its transform's path ID, with what a case sets over it
export const createSceneObject = (
  transformId: string,
  parentId: string,
  overrides: Partial<SceneObject> = {},
): SceneObject => ({
  block: "",
  childIds: [],
  gameObjectId: transformId,
  name: transformId,
  parentId,
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
  scripts: [],
  transformId,
  ...overrides,
});

describe.todo("createSceneObject");
