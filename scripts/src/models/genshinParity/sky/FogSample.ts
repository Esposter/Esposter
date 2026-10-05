import type { Vector } from "#src/models/shared/Vector";

export interface FogSample {
  lit: Vector;
  point: Vector;
  reference: Vector;
}
