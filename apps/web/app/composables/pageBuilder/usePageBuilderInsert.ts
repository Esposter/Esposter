import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockDocument } from "headless-block-editor";
import type { MaybeRefOrGetter } from "vue";

import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { WEBPAGE_NODE_TYPE_TITLE_MAP } from "@/services/pageBuilder/constants";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeSlotPointer } from "@/services/pageBuilder/getNodeSlotPointer";
import { createWebpageNodeProps } from "@/services/pageBuilder/webpageNodeDefaults";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { parseArrayIndex, parseJsonPointer } from "@esposter/shared";
import {
  getAcceptedTypes,
  getBlockNode,
  getBlockPropPointer,
  getBlockTypeDefinition,
  insertBlockNode,
} from "headless-block-editor";

// The pointer of a node's first slot when the node is a container whose children are empty, or none otherwise
const getEmptyContainerSlotPointer = (document: BlockDocument, nodePointer: string) => {
  const node = getBlockNode(document, nodePointer);
  if (!node) return undefined;

  const [slot] = Object.keys(getBlockTypeDefinition(webpageRegistry, node.type)?.slots ?? {});
  if (slot === undefined) return undefined;

  const children = node.props[slot];
  return Array.isArray(children) && children.length === 0 ? getBlockPropPointer(nodePointer, slot) : undefined;
};

// Where a node of the type goes: the first slot of the selected container when that slot is empty and accepts the type,
// Else straight after the selected node in its own slot, or the end of the root's content when no node is selected
const getInsertTarget = (document: BlockDocument, type: WebpageNodeType, nodePointer: string | undefined) => {
  const containerSlotPointer =
    nodePointer === undefined ? undefined : getEmptyContainerSlotPointer(document, nodePointer);
  if (
    containerSlotPointer !== undefined &&
    getAcceptedTypes(document, webpageRegistry, containerSlotPointer).includes(type)
  )
    return { index: 0, slotPointer: containerSlotPointer };
  if (nodePointer === undefined) return { index: document.content.length, slotPointer: "/content" };

  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  if (index === undefined) return undefined;

  return { index: index + 1, slotPointer: getNodeSlotPointer(nodePointer) };
};

// Inserts a new block of a type at an index of a slot in one open resource's webpage, selects it, and reports whether the
// Edit applied. A slot that refuses the type, or a resource with no document held, applies nothing
export const insertAt = (resourceId: string, slotPointer: string, index: number, type: WebpageNodeType): boolean => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const document = pageBuilderDocumentStore.getDocument(resourceId);
  if (!document) return false;

  const insertedId = crypto.randomUUID();
  const operations = insertBlockNode(document, webpageRegistry, slotPointer, index, {
    props: createWebpageNodeProps(type, insertedId),
    type,
  });
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
