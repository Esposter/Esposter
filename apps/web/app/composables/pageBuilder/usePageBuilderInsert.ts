import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";
import type { MaybeRefOrGetter } from "vue";

import { getInsertTarget } from "@/services/pageBuilder/getInsertTarget";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

// Inserts a new block of a type into one open resource's document, at the selection's place. An edit the slot refuses
// Does nothing and announces nothing. A landed insert is one history entry, selects the new node and is announced once
export const usePageBuilderInsert = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  getDocument: () => TDocument | undefined,
  resourceId: MaybeRefOrGetter<string>,
  announce: (message: string) => void,
) => {
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId } = pageBuilderCanvasStore;
  const insert = (type: TNode["type"]) => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument();
    if (!document) return;

    const nodeId = getSelectedNodeId(resourceIdValue);
    const target = getInsertTarget(kind, document, type, nodeId ? getNodePointer(kind, document, nodeId) : undefined);
    const title = kind.titles[type];
    if (target && insertAt(kind, document, resourceIdValue, target.slotPointer, target.index, type) && title)
      announce(`Inserted ${title}`);
  };

  return { insert };
};
