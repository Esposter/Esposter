import type { BlockNode } from "headless-block-editor";
import type { MaybeRefOrGetter } from "vue";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { getInsertTarget } from "@/services/pageBuilder/getInsertTarget";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { refuseClipboardPaste } from "@/services/pageBuilder/refuseClipboardPaste";
import { parseClipboardNodes, serializeClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { getResultAsync, parseJsonPointer } from "@esposter/shared";
import { getBlockNode, pasteBlockNodes } from "headless-block-editor";

const CANNOT_GO_HERE_MESSAGE = "This block cannot go here";

// Copy, cut and paste of the selected node in one open resource's webpage. The clipboard carries the node as JSON, and a
// Paste lands where an insert would, as a copy with fresh ids. Each landed edit is announced once through announce
export const usePageBuilderClipboard = (
  resourceId: MaybeRefOrGetter<string>,
  announce: (message: string) => void,
  deleteNode: (nodeId: string) => void,
) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  // The selected node with its id and title, or none when nothing is selected or the node is gone
  const getSelectedNode = () => {
    const resourceIdValue = toValue(resourceId);
    const document = getDocument(resourceIdValue);
    const nodeId = getSelectedNodeId(resourceIdValue);
    const nodePointer = document && nodeId ? getNodePointer(document, nodeId) : undefined;
    if (!document || nodePointer === undefined) return undefined;

    const node = getBlockNode(document, nodePointer);
    return node && { node, nodeId, title: getNodeTitle(document, parseJsonPointer(nodePointer)) };
  };
  // Writes the node to the system clipboard and reports whether it landed; a clipboard that refuses announces that instead
  const writeToClipboard = (node: BlockNode) =>
    getResultAsync(() =>
      window.navigator.clipboard.writeText(
        serializeClipboardNodes({ editor: PageBuilderEditor.Webpage, nodes: [node] }),
      ),
    ).match(
      () => true,
      (error) => {
        console.error(error);
        announce("Could not copy block");
        return false;
      },
    );
  // Reads the clipboard text, or none when the clipboard refuses to be read
  const readFromClipboard = () =>
    getResultAsync(() => window.navigator.clipboard.readText()).match(
      (text) => text,
      (error) => {
        console.error(error);
        announce("Could not paste block");
        return undefined;
      },
    );
  const copySelected = async () => {
    const selection = getSelectedNode();
    if (!selection || !(await writeToClipboard(selection.node))) return;
    if (selection.title) announce(`Copied ${selection.title}`);
  };
  // A cut is a copy that lands on the clipboard before the node is deleted, so a refused clipboard deletes nothing. The
  // Deletion names the copied node by id, since the selection may move while the clipboard write waits
  const cutSelected = async () => {
    const selection = getSelectedNode();
    if (!selection || !(await writeToClipboard(selection.node))) return;

    deleteNode(selection.nodeId);
    if (selection.title) announce(`Cut ${selection.title}`);
  };
  const pasteSelected = async () => {
    const resourceIdValue = toValue(resourceId);
    const text = await readFromClipboard();
    const clipboard = text === undefined ? undefined : parseClipboardNodes(text);
    if (!clipboard) return;

    const refusal = refuseClipboardPaste({ source: clipboard.editor, target: PageBuilderEditor.Webpage });
    if (refusal) {
      announce(refusal);
      return;
    }

    const document = getDocument(resourceIdValue);
    const [firstNode] = clipboard.nodes;
    const type = Object.values(WebpageNodeType).find((candidate) => candidate === firstNode?.type);
    if (!document) return;
    if (!type) {
      announce(CANNOT_GO_HERE_MESSAGE);
      return;
    }

    const nodeId = getSelectedNodeId(resourceIdValue);
    const target = getInsertTarget(document, type, nodeId ? getNodePointer(document, nodeId) : undefined);
    if (!target) return;

    const operations = pasteBlockNodes(document, webpageRegistry, clipboard.nodes, target.slotPointer, target.index);
    if (operations.length === 0) {
      announce(CANNOT_GO_HERE_MESSAGE);
      return;
    }

    const pastedPointer = `${target.slotPointer}/${target.index}`;
    applyEdit(resourceIdValue, operations, "Paste block").match(() => {
      const pastedDocument = getDocument(resourceIdValue);
      const pastedId = pastedDocument && getBlockNode(pastedDocument, pastedPointer)?.props.id;
      if (typeof pastedId === "string") setSelectedNodeId(resourceIdValue, pastedId);
      const title = pastedDocument ? getNodeTitle(pastedDocument, parseJsonPointer(pastedPointer)) : "";
      if (title) announce(`Pasted ${title}`);
    }, console.error);
  };

  return { copySelected, cutSelected, pasteSelected };
};
