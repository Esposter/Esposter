import type { GridSpacing } from "#src/models/GridSpacing";

// The pitch of one column: the width less the padding on both sides, shared among the columns, each taking the gap after it
export const getColumnPitch = (width: number, columnNumber: number, { gap, padding }: GridSpacing): number =>
  (width - 2 * padding + gap) / columnNumber;
