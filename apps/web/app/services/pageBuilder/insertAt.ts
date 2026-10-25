import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { insertBlockNode } from "headless-block-editor";

// Inserts a new block at an index of a slot in one open resource's document, selects it, and reports whether the edit
// Applied. The block is built from the id the insert mints for it, and a slot that refuses its type applies nothing
export const insertAt = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  resourceId: string,
  slotPointer: string,
  index: number,
  createNode: (id: string) => TNode,
): boolean => {
  const insertedId = crypto.randomUUID();
  const operations = insertBlockNode(
    document,
    kind.registry,
    kind.children,
    slotPointer,
    index,
    createNode(insertedId),
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
