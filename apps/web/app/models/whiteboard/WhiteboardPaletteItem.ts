import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";

// One thing the palette places: a placement, under the title the palette lists it by
export type WhiteboardPaletteItem = WhiteboardPlacement & { title: string };
