import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlWrapperProps } from "#src/models/MjmlWrapperProps";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML wrapper type, holding the props its model declares
export type MjmlWrapperNode = BlockNode<MjmlNodeType.Wrapper, MjmlWrapperProps>;
