import type { BlockDocument } from "headless-block-editor";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getBlockNode, getBlockPropPointer, getBlockTypeDefinition } from "headless-block-editor";

// The pointer of a node's first slot when the node is a container whose children are empty, or none otherwise
export const getEmptyContainerSlotPointer = (document: BlockDocument, nodePointer: string) => {
  const node = getBlockNode(document, nodePointer);
  if (!node) return undefined;

  const [slot] = Object.keys(getBlockTypeDefinition(webpageRegistry, node.type)?.slots ?? {});
  if (slot === undefined) return undefined;

  const children = node.props[slot];
  return Array.isArray(children) && children.length === 0 ? getBlockPropPointer(nodePointer, slot) : undefined;
};
