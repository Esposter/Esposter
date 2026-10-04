import type { Vector } from "#src/models/shared/Vector";

export interface SceneFog {
  baseHeight: number;
  density: number;
  heightFalloff: number;
  scatterDirection: Vector;
  scatterPower: number;
  scatterStrength: number;
  startDistance: number;
}
