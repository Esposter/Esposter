import type { Color } from "three";

// A part's surface carried on its own mesh (`setObjectSurface`), so one material draws parts that differ only in their
// Surfaces: its colour, and the amplitude of each of its detail's octaves, none where it has no detail
export class ObjectSurface {
  amplitudes: number[];
  color: Color;

  constructor(color: Color, amplitudes: number[]) {
    this.amplitudes = amplitudes;
    this.color = color;
  }
}
