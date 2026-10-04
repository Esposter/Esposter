import type { Vector } from "#src/models/shared/Vector";

// One family's stone as its materials hold it: its albedo as a hex, its rim glow's colour, power and strength, its
// Smoothness and the specular colour its highlights take
export interface FittedStone {
  albedo: string;
  rimColor: Vector;
  rimPower: number;
  rimStrength: number;
  smoothness: number;
  specularColor: Vector;
}
