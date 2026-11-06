import type { Panel } from "#src/models/Panel";

import { describe } from "vitest";

// A panel in the region named "a", under no condition, showing the wildcard content. A test overrides the fields it reads
export const createPanel = (overrides: Partial<Panel> = {}): Panel => ({
  condition: {},
  id: "a",
  regionId: "a",
  selectionKindContentKeyMap: {},
  wildcardContentKey: "a",
  ...overrides,
});

describe.todo("createPanel");
