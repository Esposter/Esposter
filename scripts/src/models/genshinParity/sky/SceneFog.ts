import type { Vector } from "#src/models/shared/Vector";

export interface SceneFog {
  baseHeight: number;
  color: Vector;
  density: number;
  heightFalloff: number;
  scatterColor: Vector;
  scatterDirection: Vector;
  scatterPower: number;
  scatterStrength: number;
  startDistance: number;
}
