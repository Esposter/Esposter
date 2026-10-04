import type { Vector } from "#src/models/shared/Vector";

export interface FacadeLayer {
  // How far in from its band's wall it stands, in its mesh's units, out where it is less than none, and nothing for paint
  depth: number;
  loops: [number, number][][];
  shade: Vector;
}
