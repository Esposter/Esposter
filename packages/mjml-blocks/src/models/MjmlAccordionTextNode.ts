import type { MjmlAccordionTextProps } from "#src/models/MjmlAccordionTextProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML accordion text type, holding the props its model declares
export type MjmlAccordionTextNode = BlockNode<MjmlNodeType.AccordionText, MjmlAccordionTextProps>;
