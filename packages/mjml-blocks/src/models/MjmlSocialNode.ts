import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlSocialProps } from "#src/models/MjmlSocialProps";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML social type, holding the props its model declares
export type MjmlSocialNode = BlockNode<MjmlNodeType.Social, MjmlSocialProps>;
