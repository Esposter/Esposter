import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlTextProps } from "#src/models/MjmlTextProps";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML text type, holding the props its model declares
export type MjmlTextNode = BlockNode<MjmlNodeType.Text, MjmlTextProps>;
