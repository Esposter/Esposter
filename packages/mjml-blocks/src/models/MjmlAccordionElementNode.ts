import type { MjmlAccordionElementProps } from "#src/models/MjmlAccordionElementProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML accordion element type, holding the props its model declares
export type MjmlAccordionElementNode = BlockNode<MjmlNodeType.AccordionElement, MjmlAccordionElementProps>;
