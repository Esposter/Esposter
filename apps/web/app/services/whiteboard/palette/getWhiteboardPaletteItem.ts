import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";

import { WHITEBOARD_PALETTE_GROUPS } from "@/services/whiteboard/palette/constants";
import { getWhiteboardPaletteKind } from "@/services/whiteboard/palette/getWhiteboardPaletteKind";

// The palette item a kind names, none for a kind the palette does not hold
export const getWhiteboardPaletteItem = (kind: string): WhiteboardPaletteItem | undefined =>
  WHITEBOARD_PALETTE_GROUPS.flatMap(({ items }) => items).find((item) => getWhiteboardPaletteKind(item) === kind);
