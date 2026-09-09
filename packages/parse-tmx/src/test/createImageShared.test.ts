import type { TMXImageShared } from "#src/models/tmx/shared/TMXImageShared";

import { describe } from "vitest";

export const createImageShared = (): TMXImageShared => ({
  height: 0,
  source: "",
  width: 0,
});

describe.todo(createImageShared);
