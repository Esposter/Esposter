import type { CanvasRect } from "#src/models/CanvasRect";

// A RectTransform's corners from its anchors, as Unity lays one out: its lower-left corner sits `offsetMin` from its
// Lower anchor and its upper-right `offsetMax` from its upper one, where `offsetMin = anchoredPosition − sizeDelta ×
// Pivot` and `offsetMax = offsetMin + sizeDelta`. The pivot only shares the size delta out, so a piece stretched
// Between anchors keeps its insets whatever its pivot. Every placement of a RectTransform reads this, so none
// Re-derives it
export const computeRectOffsets = ({
  pivot,
  position,
  size,
}: Pick<CanvasRect, "pivot" | "position" | "size">): Record<"offsetMax" | "offsetMin", [number, number]> => {
  const offsetMin: [number, number] = [position[0] - size[0] * pivot[0], position[1] - size[1] * pivot[1]];
  return { offsetMax: [offsetMin[0] + size[0], offsetMin[1] + size[1]], offsetMin };
};
