import type { Color } from "three";

// A part's surface carried on its own mesh (`setObjectSurface`), so one material draws parts that differ only in their
// Surfaces: its colour, the amplitude of each of its detail's octaves and the texels a metre of its detail's texture
// Spans, none of either where it has no detail
export class ObjectSurface {
  amplitudes: number[];
  color: Color;
  texelsPerMetre: number;

  constructor(color: Color, amplitudes: number[], texelsPerMetre: number) {
    this.amplitudes = amplitudes;
    this.color = color;
    this.texelsPerMetre = texelsPerMetre;
  }
}
