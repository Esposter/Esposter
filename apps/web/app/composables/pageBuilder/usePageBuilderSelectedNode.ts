import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

// The open document a kind's commands act on, and the selected node within it. The document is the one the shell draws,
// With the kind the shell was given, and the selection is the canvas's, so every command that acts on the selected node
// Shares this one lookup rather than repeating it
// The kind's signature, which each composable lists as its own inputs, so the duplicate-code gate skips it
// `jscpd:ignore-start`
export const usePageBuilderSelectedNode = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  getDocument: () => TDocument | undefined,
  resourceId: MaybeRefOrGetter<string>,
) => {
  // `jscpd:ignore-end`
  // The document the shell draws, with the kind the shell was given, or none while no document is held
  const getOpenDocument = () => {
    const document = getDocument();
    return document && { document, kind };
  };
  const pageBuilderCanvasStore = usePageBuilderCanvasStore();
  const { getSelectedNodeId } = pageBuilderCanvasStore;
  // The document, its kind and the node the selection holds, or none when nothing is selected or the node is gone
  const getSelection = () => {
    const resourceIdValue = toValue(resourceId);
    const open = getOpenDocument();
    const nodeId = getSelectedNodeId(resourceIdValue);
    if (!open || !nodeId) return undefined;

    const nodePointer = getNodePointer(kind, open.document, nodeId);
    return nodePointer === undefined ? undefined : { ...open, nodeId, nodePointer };
  };

  return { getOpenDocument, getSelection };
};
