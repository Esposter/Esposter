import type { SectionNode, TestNode } from "#src/services/constants.test";

import { getSlotPointer } from "#src/services/getSlotPointer";
import { describe, expect, expectTypeOf, test } from "vitest";

describe(getSlotPointer, () => {
  test("a pointer to a misspelt slot fails the typecheck", () => {
    expect.hasAssertions();

    expectTypeOf(getSlotPointer<SectionNode>("/content/0", "children")).toEqualTypeOf<string>();
    // @ts-expect-error: TS2345 - childern is not a slot the section node declares
    expectTypeOf(getSlotPointer<SectionNode>("/content/0", "childern")).toEqualTypeOf<string>();
    expectTypeOf(getSlotPointer<TestNode>("/content/0", "items")).toEqualTypeOf<string>();
  });
});
