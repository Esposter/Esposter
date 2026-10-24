import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getBlockLayerRows } from "headless-block-editor";

// The pointer of the node an id names, or none when no node in the document holds it. Generic over the kind, so a
// Webpage and an email are looked up the same way
export const getNodePointer = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  nodeId: string,
) =>
  getBlockLayerRows(document, kind.children)
    .map(({ nodePointer }) => nodePointer)
    .find((nodePointer) => getNodeIdAt(kind, document, nodePointer) === nodeId);
