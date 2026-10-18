import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { describe } from "vitest";
import { z } from "zod";

export const TEST_SECTION_ID: string = crypto.randomUUID();
export const TEST_SECTION_OTHER_ID: string = crypto.randomUUID();
export const TEST_HEADING_ID: string = crypto.randomUUID();
export const TEST_LIST_ID: string = crypto.randomUUID();
export const TEST_ITEM_ID: string = crypto.randomUUID();
// The nodes TEST_DOCUMENT holds: two sections, the heading in the first one
export const TEST_DOCUMENT_NODE_COUNT = 3;
export const TEST_REGISTRY: BlockRegistry = {
  root: { content: ["section"], propsSchema: z.object({ title: z.string() }) },
  types: [
    { propsSchema: z.object({}), slots: { children: ["heading", "list"] }, type: "section" },
    { propsSchema: z.object({ text: z.string() }), slots: {}, type: "heading" },
    { propsSchema: z.object({}), slots: { items: ["item"] }, type: "list" },
    { propsSchema: z.object({ text: z.string() }), slots: {}, type: "item" },
  ],
};
export const TEST_DOCUMENT: BlockDocument = {
  content: [
    {
      props: { children: [{ props: { id: TEST_HEADING_ID, text: "" }, type: "heading" }], id: TEST_SECTION_ID },
      type: "section",
    },
    { props: { children: [], id: TEST_SECTION_OTHER_ID }, type: "section" },
  ],
  root: { props: { title: "" } },
};

describe.todo("constants");
