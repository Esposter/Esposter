import type { MjmlButtonProps } from "#src/models/MjmlButtonProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML button type, holding the props its model declares
export type MjmlButtonNode = BlockNode<MjmlNodeType.Button, MjmlButtonProps>;
