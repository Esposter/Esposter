import { z } from "zod";

// One tone of a glyph a HUD button carries: its outline as one filled path on the glyph's 128 unit square, and the share
// Of white it is drawn in, since the game's icons lay a paler shape under a white one
export interface GlyphLayer {
  opacity: number;
  path: string;
}

export const glyphLayerSchema = z.object({
  opacity: z.number().min(0).max(1),
  path: z.string(),
}) satisfies z.ZodType<GlyphLayer>;
