import type { ColumnNodeProps } from "#shared/models/pageBuilder/ColumnNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Column node of a webpage: one column of a Columns node
export type ColumnNode = BlockNode<WebpageNodeType.Column, ColumnNodeProps>;
