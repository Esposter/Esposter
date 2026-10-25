import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { checkIsInsideBox } from "@/services/pageBuilder/checkIsInsideBox";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";
import { MjmlNodeType } from "mjml-blocks";

// The id of the text node whose box holds a point in the frame's own pixels, or the empty id when no text is under it.
// Texts are the only node a merge field drops into, so the lookup names them alone
export const getTextNodeIdAt = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  framePoint: { x: number; y: number },
  getChildRect: (nodeId: string) => OverlayBox | undefined,
): string =>
  getBlockLayerRows(document, kind.children)
    .map(({ nodePointer }) => getBlockNode(document, nodePointer, kind.children))
    .find((node) => node?.type === MjmlNodeType.Text && checkIsInsideBox(framePoint, getChildRect(node.props.id)))
    ?.props.id ?? "";
