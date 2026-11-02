import type { WhiteboardPaletteItem } from "@/models/whiteboard/WhiteboardPaletteItem";

// A heading of the palette and the things it places under it
export interface WhiteboardPaletteGroup {
  items: WhiteboardPaletteItem[];
  title: string;
}
