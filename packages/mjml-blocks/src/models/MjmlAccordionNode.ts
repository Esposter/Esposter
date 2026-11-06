import type { MjmlAccordionProps } from "#src/models/MjmlAccordionProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A node of the MJML accordion type, holding the props its model declares
export type MjmlAccordionNode = BlockNode<MjmlNodeType.Accordion, MjmlAccordionProps>;
