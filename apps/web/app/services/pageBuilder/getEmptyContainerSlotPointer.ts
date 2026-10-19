import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getBlockNode, getBlockPropPointer, getBlockPropValue, getBlockTypeDefinition } from "headless-block-editor";

// The pointer of a node's first slot when the node is a container whose children are empty, or none otherwise
export const getEmptyContainerSlotPointer = (document: WebpageDocument, nodePointer: string) => {
  const node = getBlockNode(document, nodePointer);
  if (!node) return undefined;

  const [slot] = Object.keys(getBlockTypeDefinition(webpageRegistry, node.type)?.slots ?? {});
  if (slot === undefined) return undefined;

  const children = getBlockPropValue(node.props, slot);
  return Array.isArray(children) && children.length === 0 ? getBlockPropPointer(nodePointer, slot) : undefined;
};
