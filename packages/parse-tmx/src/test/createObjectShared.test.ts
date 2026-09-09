import type { TMXObjectShared } from "#src/models/tmx/shared/TMXObjectShared";

import { describe } from "vitest";

export const createObjectShared = (): TMXObjectShared => ({
  gid: 0,
  height: 0,
  id: 0,
  type: "",
  width: 0,
  x: 0,
  y: 0,
});

describe.todo(createObjectShared);
