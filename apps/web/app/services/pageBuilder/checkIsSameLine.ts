import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

// Two boxes share a line when their vertical extents overlap, which is how the children of a wrapped row split into lines
export const checkIsSameLine = (box: OverlayBox, other: OverlayBox): boolean =>
  box.top < other.top + other.height && other.top < box.top + box.height;
