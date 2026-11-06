import type { MjmlHeroProps } from "#src/models/MjmlHeroProps";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A node of the MJML hero type, holding the props its model declares
export type MjmlHeroNode = BlockNode<MjmlNodeType.Hero, MjmlHeroProps>;
