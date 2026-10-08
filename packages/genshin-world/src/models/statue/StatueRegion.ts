import type { StatueLevel } from "#src/models/statue/StatueLevel";

// A region's statues, which level together: the levels the region's slice holds, the level it has reached, and the
// Oculi it holds toward the next level, which the next level takes off as it is reached
export interface StatueRegion {
  heldOculusCount: number;
  level: number;
  levels: StatueLevel[];
}
