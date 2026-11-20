import type { OverlayBox } from "#src/models/pageBuilder/OverlayBox";
import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { appendMergeFieldToText } from "#src/services/pageBuilder/email/appendMergeFieldToText";
import { getNodePointer } from "#src/services/pageBuilder/getNodePointer";
import { getTextNodeIdAt } from "#src/services/pageBuilder/getTextNodeIdAt";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { JsonPatchOperationType } from "@esposter/shared";
import { getBlockNode, getBlockPropValue } from "vue-block-editor-headless";

// Appends a merge field to the text under a point of the frame, as one edit, and reports whether the edit applied. A point
// Over no text, or a text whose content does not parse, applies nothing, as a drop anywhere else does
export const insertMergeFieldAt: PageBuilderHelper<
  boolean,
  [
    resourceId: string,
    framePoint: { x: number; y: number },
    getChildRect: (nodeId: string) => OverlayBox | undefined,
    columnName: string,
  ]
> = (kind, document, resourceId, framePoint, getChildRect, columnName) => {
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
