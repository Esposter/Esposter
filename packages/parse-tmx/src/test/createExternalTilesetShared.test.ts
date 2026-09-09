import type { TMXExternalTilesetShared } from "#src/models/tmx/shared/TMXExternalTilesetShared";

import { describe } from "vitest";

export const createExternalTilesetShared = (): TMXExternalTilesetShared => ({
  firstgid: 0,
  source: "",
});

describe.todo(createExternalTilesetShared);
