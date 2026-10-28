import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";
import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { appendMergeFieldToText } from "@/services/pageBuilder/email/appendMergeFieldToText";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getTextNodeIdAt } from "@/services/pageBuilder/getTextNodeIdAt";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { JsonPatchOperationType } from "@esposter/shared";
import { getBlockNode, getBlockPropValue } from "headless-block-editor";

// Appends a merge field to the text under a point of the frame, as one edit, and reports whether the edit applied. A point
// Over no text, or a text whose content does not parse, applies nothing, as a drop anywhere else does
export const insertMergeFieldAt = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  resourceId: string,
  framePoint: { x: number; y: number },
  getChildRect: (nodeId: string) => OverlayBox | undefined,
  columnName: string,
): boolean => {
  const nodeId = getTextNodeIdAt(kind, document, framePoint, getChildRect);
  const nodePointer = nodeId && getNodePointer(kind, document, nodeId);
  const textNode = nodePointer && getBlockNode(document, nodePointer, kind.children);
  if (!nodePointer || !textNode) return false;

  const content = noteDocumentSchema.safeParse(getBlockPropValue(textNode.props, "content"));
  if (!content.success) return false;

  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  return pageBuilderHistoryStore
    .applyEdit(
      resourceId,
      [
        {
          op: JsonPatchOperationType.Replace,
          path: `${nodePointer}/props/content`,
          value: appendMergeFieldToText(content.data, columnName),
        },
      ],
      "Insert merge field",
    )
    .match(
      () => true,
      (error) => {
        console.error(error);
        return false;
      },
    );
};
