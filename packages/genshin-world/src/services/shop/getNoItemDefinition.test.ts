import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { describe } from "vitest";

// A currency good gives its currency and never reads the bag's definition, so asking for one is a failure
export const getNoItemDefinition = (itemId: number): ItemDefinition => {
  throw new Error(`no definition asked for item ${itemId}`);
};

describe.todo("getNoItemDefinition");
