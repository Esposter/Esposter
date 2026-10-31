import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { CANNOT_GO_HERE_MESSAGE } from "@/services/pageBuilder/constants";
import { getInsertTarget } from "@/services/pageBuilder/getInsertTarget";
import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { refuseClipboardPaste } from "@/services/pageBuilder/refuseClipboardPaste";
import { parseClipboardNodes, serializeClipboardNodes } from "@/services/pageBuilder/serializeClipboardNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { getResultAsync, parseJsonPointer } from "@esposter/shared";
import { getBlockNode, pasteBlockNodes } from "headless-block-editor";

// Copy, cut and paste of the selected node in one open resource's document. The clipboard carries the node as JSON,
// Tagged with the kind's editor, and a paste lands where an insert would, as a copy with fresh ids. Each landed edit is
// Announced once through `announce`.
// The kind's signature, which each composable lists as its own inputs, so the duplicate-code gate skips it
// `jscpd:ignore-start`
export const usePageBuilderClipboard = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  getDocument: () => TDocument | undefined,
  resourceId: MaybeRefOrGetter<string>,
  announce: (message: string) => void,
  deleteNode: (nodeId: string) => boolean,
) => {
  // `jscpd:ignore-end`
  const { getOpenDocument, getSelection } = usePageBuilderSelectedNode(kind, getDocument, resourceId);
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { applyEdit } = pageBuilderHistoryStore;
  // The selected node with its id and title, or none when nothing is selected or the node is gone
  const getSelectedNode = () => {
    const selection = getSelection();
    if (!selection) return undefined;

    const { document, nodeId, nodePointer } = selection;
    const node = getBlockNode(document, nodePointer, kind.children);
    return node && { node, nodeId, title: getNodeTitle(kind, document, parseJsonPointer(nodePointer)) };
  };
  // Writes the node to the system clipboard and reports whether it landed; a clipboard that refuses announces that instead
  const writeToClipboard = (node: TNode) =>
    getResultAsync(() =>
      window.navigator.clipboard.writeText(serializeClipboardNodes({ editor: kind.editor, nodes: [node] })),
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

    if (!deleteNode(selection.nodeId)) return;
    if (selection.title) announce(`Cut ${selection.title}`);
  };
  const pasteSelected = async () => {
    const resourceIdValue = toValue(resourceId);
    const text = await readFromClipboard();
    // The document is read once the clipboard has answered, since the clipboard read waits and the document may have moved on
    const open = getOpenDocument();
    if (text === undefined || !open) return;

    const { document } = open;
    const clipboard = parseClipboardNodes(kind, text);
    if (!clipboard) {
      announce(CANNOT_GO_HERE_MESSAGE);
      return;
    }

    const refusal = refuseClipboardPaste({ source: clipboard.editor, target: kind.editor });
    if (refusal) {
      announce(refusal);
      return;
    }

    const [firstNode] = clipboard.nodes;
    if (!firstNode) {
      announce(CANNOT_GO_HERE_MESSAGE);
      return;
    }

    const nodeId = getSelectedNodeId(resourceIdValue);
    const target = getInsertTarget(
      kind,
      document,
      firstNode.type,
      nodeId ? getNodePointer(kind, document, nodeId) : undefined,
    );
    if (!target) return;

    const operations = pasteBlockNodes(
      document,
      kind.registry,
      kind.children,
      kind.nodeSchema,
      clipboard.nodes,
      target.slotPointer,
      target.index,
    );
    if (operations.length === 0) {
      announce(CANNOT_GO_HERE_MESSAGE);
      return;
    }

    const pastedPointer = `${target.slotPointer}/${target.index}`;
    applyEdit(resourceIdValue, operations, "Paste block").match(() => {
      const pasted = getOpenDocument();
      const pastedId = pasted ? getNodeIdAt(pasted.kind, pasted.document, pastedPointer) : "";
      if (pastedId) setSelectedNodeId(resourceIdValue, pastedId);
      const title = pasted ? getNodeTitle(pasted.kind, pasted.document, parseJsonPointer(pastedPointer)) : "";
      if (title) announce(`Pasted ${title}`);
    }, console.error);
  };

  return { copySelected, cutSelected, pasteSelected };
};
