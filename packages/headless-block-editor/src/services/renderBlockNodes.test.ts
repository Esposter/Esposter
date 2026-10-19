import type { BlockNode } from "#src/models/BlockNode";
import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { TEST_HEADING_ID, TEST_SECTION_ID, TEST_SECTION_OTHER_ID } from "#src/services/constants.test";
import { renderBlockNodes } from "#src/services/renderBlockNodes";
import { describe, expect, test } from "vitest";
import { z } from "zod";

interface HeadingNodeProps extends BlockNodeProps {
  text: string;
}
interface SectionNodeProps extends BlockNodeProps {
  children: HeadingNode[];
}
type HeadingNode = BlockNode<"heading", HeadingNodeProps>;
type ImageNode = BlockNode<"image">;
type SectionNode = BlockNode<"section", SectionNodeProps>;
type TestNode = HeadingNode | ImageNode | SectionNode;

const TEST_RENDER_REGISTRY: BlockRegistry<TestNode> = {
  root: { content: ["section"], propsSchema: z.object({}) },
  types: [
    { propsSchema: z.object({}), slots: { children: ["heading"] }, type: "section" },
    { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
  ],
};

const render = (node: TestNode, _definition: BlockTypeDefinition<TestNode>, slots: Record<string, unknown[]>) => ({
  children: Object.values(slots).flat(),
  id: node.props.id,
});

describe(renderBlockNodes, () => {
  const TEST_HEADING_OTHER_ID: string = crypto.randomUUID();

  test("rendering a nested document", () => {
    expect.hasAssertions();

    const nodes: TestNode[] = [
      {
        props: {
          children: [
            { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" },
            { props: { id: TEST_HEADING_OTHER_ID, text: "" }, type: "heading" },
          ],
          id: TEST_SECTION_ID,
        },
        type: "section",
      },
    ];

    expect(renderBlockNodes(nodes, TEST_RENDER_REGISTRY, render)).toStrictEqual([
      {
        children: [
          { children: [], id: TEST_HEADING_ID },
          { children: [], id: TEST_HEADING_OTHER_ID },
        ],
        id: TEST_SECTION_ID,
      },
    ]);
  });

  test("a node whose type the registry lacks", () => {
    expect.hasAssertions();

    const nodes: TestNode[] = [
      { props: { id: crypto.randomUUID() }, type: "image" },
      { props: { children: [], id: TEST_SECTION_OTHER_ID }, type: "section" },
    ];

    expect(renderBlockNodes(nodes, TEST_RENDER_REGISTRY, render)).toStrictEqual([
      { children: [], id: TEST_SECTION_OTHER_ID },
    ]);
  });
});
