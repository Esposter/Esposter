import type { BlockNode } from "#src/models/BlockNode";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";

import { TEST_HEADING_ID, TEST_REGISTRY, TEST_SECTION_ID, TEST_SECTION_OTHER_ID } from "#src/services/constants.test";
import { renderBlockNodes } from "#src/services/renderBlockNodes";
import { describe, expect, test } from "vitest";

describe(renderBlockNodes, () => {
  const TEST_HEADING_OTHER_ID: string = crypto.randomUUID();
  const TEST_IMAGE_ID: string = crypto.randomUUID();
  const render = (node: BlockNode, _definition: BlockTypeDefinition, slots: Record<string, unknown[]>) => ({
    children: Object.values(slots).flat(),
    id: node.props.id,
  });

  test("rendering a nested document", () => {
    expect.hasAssertions();

    const nodes: BlockNode[] = [
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

    expect(renderBlockNodes(nodes, TEST_REGISTRY, render)).toStrictEqual([
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

    const nodes: BlockNode[] = [
      { props: { id: TEST_IMAGE_ID }, type: "image" },
      { props: { children: [], id: TEST_SECTION_OTHER_ID }, type: "section" },
    ];

    expect(renderBlockNodes(nodes, TEST_REGISTRY, render)).toStrictEqual([{ children: [], id: TEST_SECTION_OTHER_ID }]);
  });
});
