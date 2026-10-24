import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The id of the node whose slot holds the node, or the empty id for a node in the page's own content, or none when the
// Document holds no node with that id. A slot sits at a node's props, so the container's pointer is the slot's minus two segments
export const getParentNodeId = (
  kind: PageBuilderKind,
  document: WebpageDocument,
  nodeId: string,
): string | undefined => {
  const nodePointer = getNodePointer(kind, document, nodeId);
  if (nodePointer === undefined) return undefined;

  const slotSegments = parseJsonPointer(getNodeSlotPointer(nodePointer));
  if (slotSegments.length <= 1) return "";

  return getNodeIdAt(kind, document, toJsonPointer(slotSegments.slice(0, -2)));
};
