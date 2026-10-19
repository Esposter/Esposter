import type { ColumnsNodeProps } from "#shared/models/pageBuilder/ColumnsNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Columns node of a webpage: a row of Column nodes
export type ColumnsNode = BlockNode<WebpageNodeType.Columns, ColumnsNodeProps>;
