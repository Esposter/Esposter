import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { MjmlSocialElementProps } from "#src/models/MjmlSocialElementProps";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML social element type, holding the props its model declares
export type MjmlSocialElementNode = BlockNode<MjmlNodeType.SocialElement, MjmlSocialElementProps>;
