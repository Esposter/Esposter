import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";
import type { OwnProps } from "#src/models/OwnProps";
import type { SlotKeys } from "#src/models/SlotKeys";
import type {
  HeadingNode,
  HeadingNodeProps,
  ListNode,
  SectionNode,
  SectionNodeProps,
} from "#src/services/constants.test";
import type { z } from "zod";

import { describe, expect, expectTypeOf, test } from "vitest";

declare const ownPropsSchema: z.ZodType<OwnProps<SectionNodeProps>>;
declare const section: SectionNode;
declare const sectionChildren: BlockChildren<SectionNode>;

describe("blockTypes type", () => {
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

    expectTypeOf<BlockTypeDefinition<SectionNode>["slots"]>().toEqualTypeOf<{
      children: (HeadingNode | ListNode)["type"][];
    }>();
  });

  test("a definition missing a slot its props hold is refused", () => {
    expect.hasAssertions();

    const definition: BlockTypeDefinition<SectionNode> = {
      propsSchema: ownPropsSchema,
      // @ts-expect-error: TS2741 - the children slot the props hold is missing from the slots
      slots: {},
      type: "section",
    };
    expectTypeOf(definition).toEqualTypeOf<BlockTypeDefinition<SectionNode>>();
  });

  test("a definition listing a node type its slot does not hold is refused", () => {
    expect.hasAssertions();

    const definition: BlockTypeDefinition<SectionNode> = {
      propsSchema: ownPropsSchema,
      // @ts-expect-error: TS2322 - image is not a node type the children slot holds
      slots: { children: ["image"] },
      type: "section",
    };
    expectTypeOf(definition).toEqualTypeOf<BlockTypeDefinition<SectionNode>>();
  });

  test("a read of an absent slot fails the typecheck", () => {
    expect.hasAssertions();

    expectTypeOf(sectionChildren(section)).toEqualTypeOf<{ children: readonly SectionNode[] }>();
    // @ts-expect-error: TS2339 - a section holds children, not a gallery
    expectTypeOf(sectionChildren(section).gallery).toBeAny();
  });
});
