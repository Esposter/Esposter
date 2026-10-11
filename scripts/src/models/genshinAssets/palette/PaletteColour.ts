import type { Vector } from "#src/models/shared/Vector";

// One colour of a region's palette, its hex in sRGB as the kits' colours are written beside its linear mean, with the
// Evidence it was sampled from: the texture families that feed its kit field, the texels pooled from them, and the
// Scatter of its cluster in linear channels
export interface PaletteColour {
  families: string[];
  hex: string;
  linear: Vector;
  spread: number;
  texelCount: number;
}
