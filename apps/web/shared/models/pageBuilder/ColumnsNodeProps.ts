import type { ColumnNode } from "#shared/models/pageBuilder/ColumnNode";
import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "headless-block-editor";

// The props a Columns node holds: the style it is drawn with, and the Column nodes making up its row
export interface ColumnsNodeProps extends BlockNodeProps {
  children: ColumnNode[];
  style?: NodeStyle;
}
