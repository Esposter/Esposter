import type { GroundPoint } from "genshin-engine";
import type { Resident } from "genshin-world";

// A region's data file as the fit and the residents write it: its landmarks and its residents, and every other field kept
// As the file holds it
export type RegionDataFile = Record<string, unknown> & {
  landmarks: { areaId: string; kind?: string; position: GroundPoint }[];
  residents?: Resident[];
};
