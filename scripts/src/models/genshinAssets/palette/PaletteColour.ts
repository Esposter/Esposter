import type { Vector } from "#src/models/shared/Vector";

// One colour of a region's palette, with the evidence it was sampled from: the texture families that feed its kit field,
// The texels pooled from them, and the scatter of its cluster in linear channels
export interface PaletteColour {
  families: string[];
  hex: string;
  linear: Vector;
  spread: number;
  texelCount: number;
}
