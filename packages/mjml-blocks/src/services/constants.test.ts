import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextAttributeValue } from "#src/models/MjmlRichTextAttributeValue";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { RenderMjmlDocumentOptions } from "#src/models/RenderMjmlDocumentOptions";
import type { BlockChildren, BlockNode } from "headless-block-editor";
import type { HTMLElement } from "node-html-parser";

import { createMjmlRegistry } from "#src/services/createMjmlRegistry";
import { mjmlNodeChildren } from "#src/services/mjmlNodeChildren";
import { createMjmlNodeSchema } from "#src/services/mjmlNodeSchema";
import { parse } from "node-html-parser";
import { assert, describe } from "vitest";
import { z } from "zod";

// A leaf a consumer declares beside MJML's own, which a column takes as a child
export type TestLeafNode = BlockNode<"test-leaf">;
declare module "#src/models/MjmlLeafNodes" {
  interface MjmlLeafNodes {
    "test-leaf": TestLeafNode;
  }
}

export const TEST_SECTION_ID: string = crypto.randomUUID();
export const TEST_COLUMN_ID: string = crypto.randomUUID();
export const TEST_TEXT_ID: string = crypto.randomUUID();
export const TEST_BUTTON_ID: string = crypto.randomUUID();
export const TEST_IMAGE_ID: string = crypto.randomUUID();
export const TEST_GROUP_ID: string = crypto.randomUUID();
export const TEST_HERO_ID: string = crypto.randomUUID();
export const TEST_WRAPPER_ID: string = crypto.randomUUID();
export const TEST_MAX_NODES: number = Number.MAX_SAFE_INTEGER;
const mjmlRichTextAttributeValueSchema: z.ZodType<MjmlRichTextAttributeValue> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.number(),
    z.string(),
    z.array(mjmlRichTextAttributeValueSchema),
    z.record(z.string(), mjmlRichTextAttributeValueSchema),
  ]),
);
const mjmlRichTextAttributesSchema = z.record(z.string(), mjmlRichTextAttributeValueSchema);
// The rich text document a test writes: a tree that parses as MjmlRichText, its recursion declared on the annotation
const mjmlRichTextSchema: z.ZodType<MjmlRichText> = z.object({
  attrs: mjmlRichTextAttributesSchema.optional(),
  content: z.array(z.lazy(() => mjmlRichTextSchema)).optional(),
  marks: z.array(z.object({ attrs: mjmlRichTextAttributesSchema.optional(), type: z.string() })).optional(),
  text: z.string().optional(),
  type: z.string().optional(),
});
export const TEST_RICH_TEXT: MjmlRichTextDefinition = {
  parseHtml: (html) => ({ text: html }),
  renderHtml: (content) => content.text ?? "",
  schema: mjmlRichTextSchema,
};
export const TEST_LEAF_NODE_SCHEMA: z.ZodObject<
  { props: z.ZodObject<{ id: z.ZodString }, z.core.$strict>; type: z.ZodLiteral<"test-leaf"> },
  z.core.$strict
> = z.strictObject({
  props: z.strictObject({ id: z.string() }),
  type: z.literal("test-leaf"),
}) satisfies z.ZodType<TestLeafNode>;
const TEST_MAX_CHILDREN = 100;
const TEST_SCHEMAS = createMjmlNodeSchema({
  leafNodeSchema: TEST_LEAF_NODE_SCHEMA,
  maxChildren: TEST_MAX_CHILDREN,
  richText: TEST_RICH_TEXT,
});
// The schema of a document's content: the children the body takes
export const TEST_BODY_CHILDREN_SCHEMA: z.ZodType<MjmlNode> = TEST_SCHEMAS.bodyChildrenSchema;
// The children port a test registry composes: the test leaf holds no slot, and every built-in node is MJML's own
export const TEST_CHILDREN: BlockChildren<MjmlNode> = (node) =>
  node.type === "test-leaf" ? {} : mjmlNodeChildren(node);
export const TEST_REGISTRY: MjmlRegistry = createMjmlRegistry({
  children: TEST_CHILDREN,
  leafTypes: [],
  richText: TEST_RICH_TEXT,
});
export const TEST_RENDER_OPTIONS: RenderMjmlDocumentOptions = { context: undefined, isStampingIds: false };
// The element a label's content is read from, parsed the way MJML parses a button's content
export const parseTestLabel = (content: string): HTMLElement => {
  const [element] = parse(`<mj-button>${content}</mj-button>`, { blockTextElements: { "mj-button": true } }).children;
  assert(element);
  return element;
};

describe.todo("constants");
