import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { createBlockDocumentSchema } from "#src/services/createBlockDocumentSchema";
import { exhaustiveGuard } from "@esposter/shared";
import { describe } from "vitest";
import { z } from "zod";

export type HeadingNode = BlockNode<"heading", HeadingNodeProps>;
export interface HeadingNodeProps extends BlockNodeProps {
  text: string;
}
export type ImageNode = BlockNode<"image">;
export type ItemNode = BlockNode<"item", ItemNodeProps>;
export interface ItemNodeProps extends BlockNodeProps {
  text: string;
}
export type ListNode = BlockNode<"list", ListNodeProps>;
export interface ListNodeProps extends BlockNodeProps {
  items: (HeadingNode | ItemNode)[];
}
export type SectionNode = BlockNode<"section", SectionNodeProps>;
export interface SectionNodeProps extends BlockNodeProps {
  children: (HeadingNode | ListNode)[];
  title: string;
}
export type TestDocument = BlockDocument<TestNode, TestRootProps>;
export type TestNode = HeadingNode | ImageNode | ItemNode | ListNode | SectionNode;
export interface TestRootProps {
  title: string;
}

export const TEST_SECTION_ID: string = crypto.randomUUID();
export const TEST_SECTION_OTHER_ID: string = crypto.randomUUID();
export const TEST_HEADING_ID: string = crypto.randomUUID();
export const TEST_LIST_ID: string = crypto.randomUUID();
export const TEST_ITEM_ID: string = crypto.randomUUID();
// The nodes TEST_DOCUMENT holds: two sections, the heading in the first one
export const TEST_DOCUMENT_NODE_COUNT = 3;
export const TEST_REGISTRY: BlockRegistry<TestNode, TestRootProps> = {
  root: { content: ["section"], propsSchema: z.object({ title: z.string() }) },
  types: [
    { propsSchema: z.object({ title: z.string() }), slots: { children: ["heading", "list"] }, type: "section" },
    { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
    { propsSchema: z.object({}), slots: { items: ["item"] }, type: "list" },
    { propsSchema: z.object({ text: z.string() }), slots: {}, type: "item" },
  ],
};

// The consumer's static node schemas, one per type, the way a consumer writes them: each satisfies its node type
const TEST_HEADING_SCHEMA = z.object({
  props: z.strictObject({ id: z.string(), text: z.string() }),
  type: z.literal("heading"),
}) satisfies z.ZodType<HeadingNode>;
const TEST_IMAGE_SCHEMA = z.object({
  props: z.strictObject({ id: z.string() }),
  type: z.literal("image"),
}) satisfies z.ZodType<ImageNode>;
const TEST_ITEM_SCHEMA = z.object({
  props: z.strictObject({ id: z.string(), text: z.string() }),
  type: z.literal("item"),
}) satisfies z.ZodType<ItemNode>;
const TEST_LIST_SCHEMA = z.object({
  props: z.strictObject({ id: z.string(), items: z.array(TEST_ITEM_SCHEMA) }),
  type: z.literal("list"),
}) satisfies z.ZodType<ListNode>;
const TEST_SECTION_SCHEMA = z.object({
  props: z.strictObject({
    children: z.array(z.discriminatedUnion("type", [TEST_HEADING_SCHEMA, TEST_LIST_SCHEMA])),
    id: z.string(),
    title: z.string(),
  }),
  type: z.literal("section"),
}) satisfies z.ZodType<SectionNode>;
export const TEST_NODE_SCHEMA: z.ZodType<TestNode> = z.discriminatedUnion("type", [
  TEST_HEADING_SCHEMA,
  TEST_IMAGE_SCHEMA,
  TEST_ITEM_SCHEMA,
  TEST_LIST_SCHEMA,
  TEST_SECTION_SCHEMA,
]);

// The root's content schema: only the types the test registry's root accepts
export const TEST_ROOT_CONTENT_SCHEMA: z.ZodType<TestNode> = z.discriminatedUnion("type", [TEST_SECTION_SCHEMA]);

// The consumer's children port: one exhaustive switch over the node's type
export const TEST_CHILDREN: BlockChildren<TestNode> = (node: TestNode) => {
  switch (node.type) {
    case "heading":
    case "image":
    case "item":
      return {};
    case "list":
      return { items: node.props.items };
    case "section":
      return { children: node.props.children };
    default:
      return exhaustiveGuard(node);
  }
};

// The document schema of the test registry, with a node limit
export const createTestDocumentSchema = (maxNodes: number): z.ZodType<BlockDocument<TestNode, TestRootProps>> =>
  createBlockDocumentSchema(TEST_ROOT_CONTENT_SCHEMA, TEST_REGISTRY, TEST_CHILDREN, maxNodes);

export const TEST_DOCUMENT: TestDocument = {
  content: [
    {
      props: {
        children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }],
        id: TEST_SECTION_ID,
        title: "",
      },
      type: "section",
    },
    { props: { children: [], id: TEST_SECTION_OTHER_ID, title: "" }, type: "section" },
  ],
  root: { props: { title: "" } },
};

describe.todo("constants");
