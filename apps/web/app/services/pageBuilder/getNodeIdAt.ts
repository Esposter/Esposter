import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getBlockNode } from "headless-block-editor";

// The id of the node at the pointer, or the empty id when there is no document or the pointer names no node
export const getNodeIdAt = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument | undefined,
  nodePointer: string,
): string => (document ? (getBlockNode(document, nodePointer, kind.children)?.props.id ?? "") : "");
