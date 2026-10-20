import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { getEmptyContainerSlotPointer } from "@/services/pageBuilder/getEmptyContainerSlotPointer";
import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { parseArrayIndex, parseJsonPointer } from "@esposter/shared";
import { getAcceptedTypes } from "headless-block-editor";

// Where a node of the type goes: the first slot of the selected container when that slot is empty and accepts the type,
// Else straight after the selected node in its own slot, or the end of the root's content when no node is selected
export const getInsertTarget = (document: WebpageDocument, type: WebpageNodeType, nodePointer: string | undefined) => {
  const containerSlotPointer =
    nodePointer === undefined ? undefined : getEmptyContainerSlotPointer(document, nodePointer);
  if (
    containerSlotPointer !== undefined &&
    getAcceptedTypes(document, webpageRegistry, webpageNodeChildren, containerSlotPointer).includes(type)
  )
    return { index: 0, slotPointer: containerSlotPointer };
  if (nodePointer === undefined) return { index: document.content.length, slotPointer: "/content" };

  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (index === undefined) return undefined;

  return { index: index + 1, slotPointer: getNodeSlotPointer(nodePointer) };
};
