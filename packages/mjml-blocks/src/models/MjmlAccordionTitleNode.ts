import type { MjmlAccordionTitleProps } from "#src/models/MjmlAccordionTitleProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML accordion title type, holding the props its model declares
export type MjmlAccordionTitleNode = BlockNode<MjmlNodeType.AccordionTitle, MjmlAccordionTitleProps>;
