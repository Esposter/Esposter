import type { GroundPoint } from "genshin-engine";

// An NPC placed in a region, in the region's own axes: the NPC's id, the place it stands at and its turn in radians
export interface ResidentPlacement {
  npcId: number;
  position: GroundPoint;
  region: string;
  rotation: number;
}
