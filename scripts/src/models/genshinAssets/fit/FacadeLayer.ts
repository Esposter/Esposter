import type { Vector } from "#src/models/shared/Vector";

export interface FacadeLayer {
  loops: [number, number][][];
  shade: Vector;
}
