import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getInsertTarget } from "@/services/pageBuilder/getInsertTarget";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { insertAt } from "@/services/pageBuilder/insertAt";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

// Inserts a new block of a type into one open resource's document, at the selection's place. An edit the slot refuses
// Does nothing and announces nothing. A landed insert is one history entry, selects the new node and is announced once
// The kind's signature, which each composable lists as its own inputs, so the duplicate-code gate skips it
// `jscpd:ignore-start`
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
  // `jscpd:ignore-end`
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId } = pageBuilderCanvasStore;
  // A palette item may insert a block its type builds differently, such as a merge field's text, so its node is built by the caller
  const insert = (type: TNode["type"], createNode: (id: string) => TNode = (id) => kind.createNode(type, id)) => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument();
    if (!document) return;

    const nodeId = getSelectedNodeId(resourceIdValue);
    const target = getInsertTarget(kind, document, type, nodeId ? getNodePointer(kind, document, nodeId) : undefined);
    const title = kind.titles[type];
    if (target && insertAt(kind, document, resourceIdValue, target.slotPointer, target.index, createNode) && title)
      announce(`Inserted ${title}`);
  };

  return { insert };
};
