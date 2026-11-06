import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";

import { WHITEBOARD_PALETTE_GROUPS } from "@/services/whiteboard/palette/constants";
import { getWhiteboardPaletteKind } from "@/services/whiteboard/palette/getWhiteboardPaletteKind";
import { WhiteboardPaletteIconMap } from "@/services/whiteboard/palette/WhiteboardPaletteIconMap";

// The whiteboard's palette as the shared palette lists it: each item under its group, with its kind and its icon
export const getWhiteboardPaletteGroups = (): PaletteGroup[] =>
  WHITEBOARD_PALETTE_GROUPS.map(({ items, title }) => ({
    items: items.map((item) => {
      const kind = getWhiteboardPaletteKind(item);
      return { icon: WhiteboardPaletteIconMap[kind], kind, title: item.title };
    }),
    title,
  }));
