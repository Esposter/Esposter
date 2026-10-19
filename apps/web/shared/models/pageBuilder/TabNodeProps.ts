import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Tab node holds: its label on the tab button, the style it is drawn with, and the placeable nodes of its panel
export interface TabNodeProps extends BlockNodeProps {
  children: WebpagePlaceableNode[];
  label: string;
  style?: NodeStyle;
}
