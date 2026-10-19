import type { MjmlDividerProps } from "#src/models/MjmlDividerProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML divider type, holding the props its model declares
export type MjmlDividerNode = BlockNode<MjmlNodeType.Divider, MjmlDividerProps>;
