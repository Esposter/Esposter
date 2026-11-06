import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// The preview a drag draws in place pushes the children after it along their slot's axis, and the drop index is read off
// Their boxes, so a pointer that sits on a boundary would flip the index with every redraw. The children after the preview
// Are read where they stood before it was drawn: the distance from the preview's start to the first of them is what it
// Pushed them by, gaps included
export const createUnshiftedChildRect = ({
  getChildRect,
  isHorizontal,
  previewId,
  trailingChildIds,
}: {
  getChildRect: (childId: string) => OverlayBox | undefined;
  isHorizontal: boolean;
  previewId: string;
  trailingChildIds: readonly string[];
}) => {
  const previewRect = getChildRect(previewId);
  const firstTrailingId = trailingChildIds[0];
  const firstTrailingRect = firstTrailingId === undefined ? undefined : getChildRect(firstTrailingId);
  if (!previewRect || !firstTrailingRect) return getChildRect;

  const shift = isHorizontal ? firstTrailingRect.left - previewRect.left : firstTrailingRect.top - previewRect.top;
  return (childId: string) => {
    const rect = getChildRect(childId);
    if (!rect || !trailingChildIds.includes(childId)) return rect;

    return isHorizontal ? { ...rect, left: rect.left - shift } : { ...rect, top: rect.top - shift };
  };
};
