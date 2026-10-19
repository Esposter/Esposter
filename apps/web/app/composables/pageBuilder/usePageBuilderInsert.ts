import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { MaybeRefOrGetter } from "vue";

import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { getInsertTarget } from "@/services/pageBuilder/getInsertTarget";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

// Inserts a new block of a type into one open resource's webpage, at the selection's place. An edit the slot refuses
// Does nothing and announces nothing. A landed insert is one history entry, selects the new node and is announced once
export const usePageBuilderInsert = (resourceId: MaybeRefOrGetter<string>, announce: (message: string) => void) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId } = pageBuilderCanvasStore;
  const insert = (type: WebpageNodeType) => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument(resourceIdValue);
    if (!document) return;

    const nodeId = getSelectedNodeId(resourceIdValue);
    const target = getInsertTarget(document, type, nodeId ? getNodePointer(document, nodeId) : undefined);
    if (target && insertAt(resourceIdValue, target.slotPointer, target.index, type))
      announce(`Inserted ${WEBPAGE_NODE_TYPE_TITLE_MAP[type]}`);
  };

  return { insert };
};
