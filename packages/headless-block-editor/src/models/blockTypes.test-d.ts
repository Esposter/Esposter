import type { BlockNode } from "#src/models/BlockNode";
import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";
import type { OwnProps } from "#src/models/OwnProps";
import type { SlotKeys } from "#src/models/SlotKeys";
import type { HeadingNodeProps, SectionNode, SectionNodeProps } from "#src/services/constants.test";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("blockTypes type", () => {
  test("a node's props default to the id alone", () => {
    expect.hasAssertions();

    expectTypeOf<BlockNode["props"]>().toEqualTypeOf<BlockNodeProps>();
    expectTypeOf<BlockNode["type"]>().toEqualTypeOf<string>();
  });

  test("a slot key is the prop holding a list of nodes", () => {
    expect.hasAssertions();

    expectTypeOf<SlotKeys<SectionNodeProps>>().toEqualTypeOf<"children">();
    expectTypeOf<SlotKeys<HeadingNodeProps>>().toEqualTypeOf<never>();
  });

  test("own props drop the id and the slots", () => {
    expect.hasAssertions();

    expectTypeOf<OwnProps<SectionNodeProps>>().toEqualTypeOf<{ title: string }>();
    expectTypeOf<OwnProps<HeadingNodeProps>>().toEqualTypeOf<{ text: string }>();
  });

  test("a definition's slots name the node types of every slot", () => {
    expect.hasAssertions();

    expectTypeOf<BlockTypeDefinition<SectionNode>["slots"]>().toEqualTypeOf<{ children: "heading"[] }>();
  });
});
