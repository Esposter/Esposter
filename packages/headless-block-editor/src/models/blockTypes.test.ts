import type { BlockNode } from "#src/models/BlockNode";
import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";
import type { LooseBlockDocument } from "#src/models/LooseBlockDocument";
import type { OwnProps } from "#src/models/OwnProps";
import type { SlotKeys } from "#src/models/SlotKeys";

import { TEST_HEADING_ID, TEST_SECTION_ID } from "#src/services/constants.test";
import { getBlockNode } from "#src/services/getBlockNode";
import { renderBlockNodes } from "#src/services/renderBlockNodes";
import { updateBlockNodeProps } from "#src/services/updateBlockNodeProps";
import { describe, expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

interface HeadingNodeProps extends BlockNodeProps {
  text: string;
}
type HeadingNode = BlockNode<"heading", HeadingNodeProps>;
interface SectionNodeProps extends BlockNodeProps {
  children: HeadingNode[];
  title: string;
}
type SectionNode = BlockNode<"section", SectionNodeProps>;

describe("block types", () => {
  test("a node's props default to the id alone", () => {
    expect.hasAssertions();

    const node: BlockNode = { props: { id: "" }, type: "" };
    expectTypeOf<BlockNode["props"]>().toEqualTypeOf<BlockNodeProps>();
    expectTypeOf<BlockNode["type"]>().toEqualTypeOf<string>();
    expect(node).toStrictEqual({ props: { id: "" }, type: "" });
  });

  test("a slot key is the prop holding a list of nodes", () => {
    expect.hasAssertions();

    const slotKey: SlotKeys<SectionNodeProps> = "children";
    expectTypeOf<SlotKeys<SectionNodeProps>>().toEqualTypeOf<"children">();
    expectTypeOf<SlotKeys<HeadingNodeProps>>().toEqualTypeOf<never>();
    expect(slotKey).toBe("children");
  });

  test("own props drop the id and the slots", () => {
    expect.hasAssertions();

    const ownProps: OwnProps<SectionNodeProps> = { title: "" };
    expectTypeOf<OwnProps<SectionNodeProps>>().toEqualTypeOf<{ title: string }>();
    expectTypeOf<OwnProps<HeadingNodeProps>>().toEqualTypeOf<{ text: string }>();
    expect(ownProps).toStrictEqual({ title: "" });
  });

  test("a definition's slots name the node types of every slot", () => {
    expect.hasAssertions();

    const sectionDefinition: BlockTypeDefinition<SectionNode> = {
      propsSchema: z.object({ title: z.string() }),
      slots: { children: ["heading"] },
      type: "section",
    };
    expectTypeOf<BlockTypeDefinition<SectionNode>["slots"]>().toEqualTypeOf<{ children: "heading"[] }>();
    expect(sectionDefinition.slots).toStrictEqual({ children: ["heading"] });
  });

  test("a definition missing one of its slots is refused", () => {
    expect.hasAssertions();

    const missingSlotDefinition: BlockTypeDefinition<SectionNode> = {
      propsSchema: z.object({ title: z.string() }),
      // @ts-expect-error: TS2741 - the children slot the props hold is missing from the slots
      slots: {},
      type: "section",
    };
    expect(missingSlotDefinition.type).toBe("section");
  });

  test("an interface-typed node passes through the JSON layer", () => {
    expect.hasAssertions();

    const heading: HeadingNode = { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" };
    const section: SectionNode = { props: { children: [heading], id: TEST_SECTION_ID, title: "" }, type: "section" };
    const document: LooseBlockDocument = { content: [section], root: { props: {} } };
    const nodes: (HeadingNode | SectionNode)[] = [section];
    const registry: BlockRegistry<HeadingNode | SectionNode> = {
      root: { content: ["section"], propsSchema: z.object({}) },
      types: [
        { propsSchema: z.object({ title: z.string() }), slots: { children: ["heading"] }, type: "section" },
        { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
      ],
    };

    expect(getBlockNode(document, "/content/0")).toStrictEqual(section);
    expect(updateBlockNodeProps("/content/0", section.props).map((operation) => operation.path)).toStrictEqual([
      `/content/0/props/children`,
      `/content/0/props/id`,
      `/content/0/props/title`,
    ]);
    expect(
      renderBlockNodes(nodes, registry, (node, _definition, slots) => ({
        children: Object.values(slots).flat(),
        id: node.props.id,
      })),
    ).toStrictEqual([{ children: [{ children: [], id: TEST_HEADING_ID }], id: TEST_SECTION_ID }]);
  });
});
