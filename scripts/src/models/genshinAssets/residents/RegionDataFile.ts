import type { GroundPoint } from "genshin-engine";
import type { Resident } from "genshin-world";

// A region's data file as the fit and the residents write it: its landmarks and its residents, and every other field
// Kept as the file holds it
export type RegionDataFile = {
  landmarks: { areaId: string; id: string; kind?: string; position: GroundPoint }[];
  residents?: Resident[];
} & Record<string, unknown>;
