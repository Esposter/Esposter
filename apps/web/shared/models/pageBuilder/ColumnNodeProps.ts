import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { WebpagePlaceableNode } from "#shared/models/pageBuilder/WebpagePlaceableNode";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Column node holds: the style it is drawn with, and the placeable nodes its one column holds
export interface ColumnNodeProps extends BlockNodeProps {
  children: WebpagePlaceableNode[];
  style?: NodeStyle;
}
