import type { TooltipNodeProps } from "#shared/models/pageBuilder/TooltipNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "headless-block-editor";

// A Tooltip node of a webpage: a button whose text shows on hover and on focus
export type TooltipNode = BlockNode<WebpageNodeType.Tooltip, TooltipNodeProps>;
