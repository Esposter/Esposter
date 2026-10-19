import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlRawProps } from "#src/models/MjmlRawProps";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML raw type, holding the props its model declares
export type MjmlRawNode = BlockNode<MjmlNodeType.Raw, MjmlRawProps>;
