import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlSectionProps } from "#src/models/MjmlSectionProps";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML section type, holding the props its model declares
export type MjmlSectionNode = BlockNode<MjmlNodeType.Section, MjmlSectionProps>;
