import type { TMXLayerShared } from "#src/models/tmx/shared/TMXLayerShared";

import { describe } from "vitest";

export const createLayerShared = (): TMXLayerShared => ({
  height: 0,
  id: 0,
  name: "",
  type: "",
  width: 0,
});

describe.todo(createLayerShared);
