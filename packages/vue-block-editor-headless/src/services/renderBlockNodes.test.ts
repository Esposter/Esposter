import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { TEST_HEADING_ID, TEST_SECTION_ID, TEST_SECTION_OTHER_ID } from "#src/services/constants.test";
import { renderBlockNodes } from "#src/services/renderBlockNodes";
import { exhaustiveGuard } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { z } from "zod";

type HeadingNode = BlockNode<"heading", HeadingNodeProps>;
interface HeadingNodeProps extends BlockNodeProps {
  text: string;
}
type ImageNode = BlockNode<"image">;
type SectionNode = BlockNode<"section", SectionNodeProps>;
interface SectionNodeProps extends BlockNodeProps {
  children: HeadingNode[];
}
type TestNode = HeadingNode | ImageNode | SectionNode;

// The consumer's children port for the test nodes: one exhaustive switch over the node's type
const TEST_RENDER_CHILDREN: BlockChildren<TestNode> = (node) => {
  switch (node.type) {
    case "heading":
    case "image":
      return {};
    case "section":
      return { children: node.props.children };
    default:
      return exhaustiveGuard(node);
  }
};

const render = (node: TestNode, _definition: BlockTypeDefinition, slots: Record<string, unknown[]>) => ({
  children: Object.values(slots).flat(),
  id: node.props.id,
});

describe(renderBlockNodes, () => {
  const TEST_RENDER_REGISTRY: BlockRegistry<TestNode> = {
    root: { content: ["section"], propsSchema: z.object({}) },
    types: [
      { propsSchema: z.object({}), slots: { children: ["heading"] }, type: "section" },
      { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
    ],
  };

  const TEST_HEADING_OTHER_ID: string = crypto.randomUUID();

  test("a renderer reads a child through the port", () => {
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

    expect(renderBlockNodes(nodes, TEST_RENDER_REGISTRY, TEST_RENDER_CHILDREN, render)).toStrictEqual([
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

    expect(renderBlockNodes(nodes, TEST_RENDER_REGISTRY, TEST_RENDER_CHILDREN, render)).toStrictEqual([
      { children: [], id: TEST_SECTION_OTHER_ID },
    ]);
  });
});
