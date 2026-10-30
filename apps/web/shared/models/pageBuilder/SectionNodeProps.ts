import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";
import type { SECTION_TAGS } from "#shared/services/pageBuilder/constants";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Section node holds: the semantic tag it renders under, the style it is drawn with, and the placeable nodes it holds
export interface SectionNodeProps extends BlockNodeProps {
  children: WebpagePlaceableNode[];
  style?: NodeStyle;
  tag: (typeof SECTION_TAGS)[number];
}
