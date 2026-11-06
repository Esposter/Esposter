import type { MjmlGroupProps } from "#src/models/MjmlGroupProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A node of the MJML group type, holding the props its model declares
export type MjmlGroupNode = BlockNode<MjmlNodeType.Group, MjmlGroupProps>;
