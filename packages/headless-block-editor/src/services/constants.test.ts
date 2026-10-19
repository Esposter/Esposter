import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockNodeProps } from "#src/models/BlockNodeProps";
import type { BlockRegistry } from "#src/models/BlockRegistry";

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
