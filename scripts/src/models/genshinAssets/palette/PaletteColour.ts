import type { Vector } from "#src/models/shared/Vector";

// One colour of a region's palette, with the evidence it was sampled from: the families whose textures gave its kit
// Field texels, the texels pooled from them, and the scatter of its cluster in linear channels
export interface PaletteColour {
  families: string[];
  hex: string;
  linear: Vector;
  spread: number;
  texelCount: number;
}
