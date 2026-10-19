import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";
import type { BlockNode, SlotKeys } from "headless-block-editor";

// The rendered children of each slot a node type declares, keyed by the slots its props interface holds
export type NodeSlots<TNode extends BlockNode> = Record<SlotKeys<TNode["props"]>, HtmlNode[]>;
