import type { MjmlNavbarProps } from "#src/models/MjmlNavbarProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "headless-block-editor";

// A node of the MJML navbar type, holding the props its model declares
export type MjmlNavbarNode = BlockNode<MjmlNodeType.Navbar, MjmlNavbarProps>;
