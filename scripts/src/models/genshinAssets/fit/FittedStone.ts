import type { Vector } from "#src/models/shared/Vector";

// One family's stone as its materials hold it: its albedo as a hex, its rim glow's colour, power and strength and the
// Length it is drawn from, its smoothness and the specular colour its highlights take
export interface FittedStone {
  albedo: string;
  glowRange: number;
  rimColor: Vector;
  rimPower: number;
  rimStrength: number;
  smoothness: number;
  specularColor: Vector;
}
