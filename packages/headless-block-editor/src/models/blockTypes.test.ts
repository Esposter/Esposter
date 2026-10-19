import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockTypeDefinition } from "#src/models/BlockTypeDefinition";
import type { HeadingNode, SectionNode, TestDocument, TestRootProps } from "#src/services/constants.test";

import { TEST_HEADING_ID, TEST_SECTION_ID } from "#src/services/constants.test";
import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { getBlockNode } from "#src/services/getBlockNode";
import { getBlockTypeDefinition } from "#src/services/getBlockTypeDefinition";
import { renderBlockNodes } from "#src/services/renderBlockNodes";
import { updateBlockNodeProps } from "#src/services/updateBlockNodeProps";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("block types", () => {
  const heading: HeadingNode = { props: { id: TEST_HEADING_ID, text: "" }, type: "heading" };
  const section: SectionNode = { props: { children: [heading], id: TEST_SECTION_ID, title: "" }, type: "section" };
  const registry: BlockRegistry<
    HeadingNode | SectionNode,
    TestRootProps,
    BlockTypeDefinition<HeadingNode> | BlockTypeDefinition<SectionNode>
  > = {
    root: { content: ["section"], propsSchema: z.object({ title: z.string() }) },
    types: [
      { propsSchema: z.object({ title: z.string() }), slots: { children: ["heading"] }, type: "section" },
      { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
    ],
  };
  const renderedNodes = [{ children: [{ children: [], id: TEST_HEADING_ID }], id: TEST_SECTION_ID }];
  interface RenderedNode {
    children: RenderedNode[];
    id: string;
  }
  const renderNode = (
    node: HeadingNode | SectionNode,
    _definition: BlockTypeDefinition<HeadingNode> | BlockTypeDefinition<SectionNode>,
    slots: Record<string, RenderedNode[]>,
  ): RenderedNode => ({ children: Object.values(slots).flat(), id: node.props.id });

  test("an interface-typed node passes through the JSON layer", () => {
    expect.hasAssertions();

    const document: TestDocument = { content: [section], root: { props: { title: "" } } };
    const nodes: (HeadingNode | SectionNode)[] = [section];

    expect(getBlockNode(document, "/content/0")).toStrictEqual(section);
    expect(updateBlockNodeProps("/content/0", section.props).map((operation) => operation.path)).toStrictEqual([
      `/content/0/props/children`,
      `/content/0/props/id`,
      `/content/0/props/title`,
    ]);
    expect(renderBlockNodes(nodes, registry, renderNode)).toStrictEqual(renderedNodes);
  });

  test("a registry of per-type definitions passes the services with no cast", () => {
    expect.hasAssertions();

    const document: BlockDocument<HeadingNode | SectionNode, TestRootProps> = {
      content: [section],
      root: { props: { title: "" } },
    };

    expect(getBlockTypeDefinition(registry, "heading")?.type).toBe("heading");
    expect(
      createBlockDocumentSchema<HeadingNode | SectionNode, TestRootProps>(registry, 2).safeParse(document).success,
    ).toBe(true);
    expect(renderBlockNodes(document.content, registry, renderNode)).toStrictEqual(renderedNodes);
  });
});
