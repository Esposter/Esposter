import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

import { describe } from "vitest";

// One panzoom's context over an element and its parent, at the identity transform with no gesture in progress
export const createPanzoomContext = (
  element: PanzoomElement,
  parent: PanzoomElement,
  options: PanzoomOptions = {},
): PanzoomContext => ({
  element,
  isClickSuppressed: false,
  options,
  parent,
  pointers: new Map(),
  state: { scale: 1, x: 0, y: 0 },
  styles: new Map(),
});

describe.todo("createPanzoomContext");
