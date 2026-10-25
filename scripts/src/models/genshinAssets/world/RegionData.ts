import type { GroundPoint } from "genshin-engine";

// A region's own data as its file holds it: the landmarks its capital is among
export interface RegionData {
  landmarks: { id: string; position: GroundPoint }[];
}
