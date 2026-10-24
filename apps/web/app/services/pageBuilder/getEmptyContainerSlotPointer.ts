import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getBlockNode, getBlockPropPointer, getBlockPropValue, getBlockTypeDefinition } from "headless-block-editor";

// The pointer of a node's first slot when the node is a container whose children are empty, or none otherwise
export const getEmptyContainerSlotPointer = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  nodePointer: string,
) => {
  const node = getBlockNode(document, nodePointer, kind.children);
  if (!node) return undefined;

  const [slot] = Object.keys(getBlockTypeDefinition(kind.registry, node.type)?.slots ?? {});
  if (slot === undefined) return undefined;

  const children = getBlockPropValue(node.props, slot);
  return Array.isArray(children) && children.length === 0 ? getBlockPropPointer(nodePointer, slot) : undefined;
};
