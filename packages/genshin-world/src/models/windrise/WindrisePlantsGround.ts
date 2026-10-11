import type { GroundLayer } from "genshin-engine";

// The ground Windrise's flowers are scattered over: its height at a point, the share of each of its layers there given
// The height and how steep it is, and the water's level, under which no flower grows
export interface WindrisePlantsGround {
  getHeight: (x: number, z: number) => number;
  getWeights: (height: number, slope: number, x: number, z: number) => Readonly<Record<GroundLayer, number>>;
  waterLevel: number;
}
