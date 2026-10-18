import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { BlockDocument, BlockRegistry } from "headless-block-editor";

import { createMjmlRegistry } from "#src/services/createMjmlRegistry";
import { describe } from "vitest";
import { z } from "zod";

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
export const TEST_REGISTRY: BlockRegistry<MjmlBlockTypeDefinition> = createMjmlRegistry({
  leafTypes: [],
  richText: TEST_RICH_TEXT,
});
export const TEST_DOCUMENT: BlockDocument = { content: [], root: { props: {} } };

describe.todo("constants");
