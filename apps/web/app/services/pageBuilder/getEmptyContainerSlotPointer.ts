import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getBlockNode, getBlockPropPointer, getBlockPropValue, getBlockTypeDefinition } from "headless-block-editor";

// The pointer of a node's first slot when the node is a container whose children are empty, or none otherwise
export const getEmptyContainerSlotPointer: PageBuilderHelper<string | undefined, [nodePointer: string]> = (
  kind,
  document,
  nodePointer,
) => {
  const node = getBlockNode(document, nodePointer, kind.children);
  if (!node) return undefined;

  const [slot] = Object.keys(getBlockTypeDefinition(kind.registry, node.type)?.slots ?? {});
  if (slot === undefined) return undefined;

  const children = getBlockPropValue(node.props, slot);
  return Array.isArray(children) && children.length === 0 ? getBlockPropPointer(nodePointer, slot) : undefined;
};
