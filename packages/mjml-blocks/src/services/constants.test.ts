import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { RenderMjmlDocumentOptions } from "#src/models/RenderMjmlDocumentOptions";
import type { BlockChildren, BlockNode } from "headless-block-editor";

import { createMjmlRegistry } from "#src/services/createMjmlRegistry";
import { mjmlNodeChildren } from "#src/services/mjmlNodeChildren";
import { createMjmlNodeSchema } from "#src/services/mjmlNodeSchema";
import { describe } from "vitest";
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
export const TEST_RICH_TEXT: MjmlRichTextDefinition<string> = {
  parseHtml: (html) => html,
  renderHtml: (html) => html,
  schema: z.string(),
};
export const TEST_LEAF_NODE_SCHEMA: z.ZodObject<
  { props: z.ZodObject<{ id: z.ZodString }, z.core.$strict>; type: z.ZodLiteral<"test-leaf"> },
  z.core.$strict
> = z.strictObject({
  props: z.strictObject({ id: z.string() }),
  type: z.literal("test-leaf"),
}) satisfies z.ZodType<TestLeafNode>;
export const TEST_NODE_SCHEMA: z.ZodType<MjmlNode> = createMjmlNodeSchema({
  leafNodeSchema: TEST_LEAF_NODE_SCHEMA,
  richText: TEST_RICH_TEXT,
});
// The children port a test registry composes: the test leaf holds no slot, and every built-in node is MJML's own
export const TEST_CHILDREN: BlockChildren<MjmlNode> = (node) =>
  node.type === "test-leaf" ? {} : mjmlNodeChildren(node);
export const TEST_REGISTRY: MjmlRegistry = createMjmlRegistry({
  children: TEST_CHILDREN,
  leafTypes: [],
  richText: TEST_RICH_TEXT,
});
export const TEST_RENDER_OPTIONS: RenderMjmlDocumentOptions = { context: undefined, isStampingIds: false };

describe.todo("constants");
