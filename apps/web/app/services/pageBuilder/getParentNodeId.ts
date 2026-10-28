import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { getSlotOwnerId } from "@/services/pageBuilder/getSlotOwnerId";
import { parseJsonPointer } from "@esposter/shared";

// The id of the node whose slot holds the node, or the empty id for a node in the page's own content, or none when the
// Document holds no node with that id. A slot sits at a node's props, so the container's pointer is the slot's minus two segments
export const getParentNodeId: PageBuilderHelper<string | undefined, [nodeId: string]> = (kind, document, nodeId) => {
  const nodePointer = getNodePointer(kind, document, nodeId);
  if (nodePointer === undefined) return undefined;

  const slotPointer = getNodeSlotPointer(nodePointer);
  if (parseJsonPointer(slotPointer).length <= 1) return "";

  return getSlotOwnerId(kind, document, slotPointer);
};
