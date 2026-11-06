import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlTableProps } from "#src/models/MjmlTableProps";
import type { BlockNode } from "vue-block-editor-headless";

// A node of the MJML table type, holding the props its model declares
export type MjmlTableNode = BlockNode<MjmlNodeType.Table, MjmlTableProps>;
