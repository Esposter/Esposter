import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { checkIsInsideBox } from "@/services/pageBuilder/checkIsInsideBox";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";
import { MjmlNodeType } from "mjml-blocks";

// The id of the text node whose box holds a point in the frame's own pixels, or the empty id when no text is under it.
// Texts are the only node a merge field drops into, so the lookup names them alone
export const getTextNodeIdAt: PageBuilderHelper<
  string,
  [framePoint: { x: number; y: number }, getChildRect: (nodeId: string) => OverlayBox | undefined]
> = (kind, document, framePoint, getChildRect) =>
  getBlockLayerRows(document, kind.children)
    .map(({ nodePointer }) => getBlockNode(document, nodePointer, kind.children))
    .find((node) => node?.type === MjmlNodeType.Text && checkIsInsideBox(framePoint, getChildRect(node.props.id)))
    ?.props.id ?? "";
