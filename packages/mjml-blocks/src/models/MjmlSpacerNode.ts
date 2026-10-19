import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlSpacerProps } from "#src/models/MjmlSpacerProps";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML spacer type, holding the props its model declares
export type MjmlSpacerNode = BlockNode<MjmlNodeType.Spacer, MjmlSpacerProps>;
