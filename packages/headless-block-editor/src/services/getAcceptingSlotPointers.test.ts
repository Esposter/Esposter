import type { BlockRegistry } from "#src/models/BlockRegistry";

import { TEST_DOCUMENT, TEST_REGISTRY } from "#src/services/constants.test";
import { getAcceptingSlotPointers } from "#src/services/getAcceptingSlotPointers";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(getAcceptingSlotPointers, () => {
  const recursiveRegistry: BlockRegistry = {
    ...TEST_REGISTRY,
    types: [
      { propsSchema: z.object({}), slots: { children: ["heading", "list", "section"] }, type: "section" },
      { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
      { propsSchema: z.object({}), slots: { items: ["item"] }, type: "list" },
      { propsSchema: z.object({ text: z.string() }), slots: {}, type: "item" },
    ],
  };

  test("accepting slots for a heading", () => {
    expect.hasAssertions();

    expect(getAcceptingSlotPointers(TEST_DOCUMENT, TEST_REGISTRY, "/content/0/props/children/0")).toStrictEqual([
      "/content/0/props/children",
      "/content/1/props/children",
    ]);
  });

  test("accepting slots for a section", () => {
    expect.hasAssertions();

    expect(getAcceptingSlotPointers(TEST_DOCUMENT, TEST_REGISTRY, "/content/0")).toStrictEqual(["/content"]);
  });

  test("accepting slots never include a slot inside the node", () => {
    expect.hasAssertions();

    expect(getAcceptingSlotPointers(TEST_DOCUMENT, recursiveRegistry, "/content/0")).toStrictEqual([
      "/content",
      "/content/1/props/children",
    ]);
  });

  test("accepting slots of a pointer naming no node", () => {
    expect.hasAssertions();

    expect(getAcceptingSlotPointers(TEST_DOCUMENT, TEST_REGISTRY, "/content/5")).toStrictEqual([]);
  });
});
