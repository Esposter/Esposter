import type { MjmlNavbarLinkProps } from "#src/models/MjmlNavbarLinkProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML navbar link type, holding the props its model declares
export type MjmlNavbarLinkNode = BlockNode<MjmlNodeType.NavbarLink, MjmlNavbarLinkProps>;
