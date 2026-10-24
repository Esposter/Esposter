import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

import { createWebpageNode } from "@/services/pageBuilder/webpageNodeDefaults";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { insertBlockNode } from "headless-block-editor";

// Inserts a new block of a type at an index of a slot in one open resource's webpage, selects it, and reports whether the
// Edit applied. A slot that refuses the type, or a resource with no document held, applies nothing
export const insertAt = (resourceId: string, slotPointer: string, index: number, type: WebpageNodeType): boolean => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const open = pageBuilderDocumentStore.getOpenDocument(resourceId);
  if (!open) return false;

  const { document, kind } = open;
  const insertedId = crypto.randomUUID();
  const operations = insertBlockNode(
    document,
    kind.registry,
    kind.children,
    slotPointer,
    index,
    createWebpageNode(type, insertedId),
  );
  if (operations.length === 0) return false;

  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  return pageBuilderHistoryStore.applyEdit(resourceId, operations, "Insert block").match(
    () => {
      pageBuilderCanvasStore.setSelectedNodeId(resourceId, insertedId);
      return true;
    },
    (error) => {
      console.error(error);
      return false;
    },
  );
};
