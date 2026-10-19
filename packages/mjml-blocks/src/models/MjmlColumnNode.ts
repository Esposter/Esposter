import type { MjmlColumnProps } from "#src/models/MjmlColumnProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML column type, holding the props its model declares
export type MjmlColumnNode = BlockNode<MjmlNodeType.Column, MjmlColumnProps>;
