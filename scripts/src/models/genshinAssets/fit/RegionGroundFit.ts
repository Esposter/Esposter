import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

export interface RegionGroundFit {
  isQualified: boolean;
  // Each outlined area's build, in the catalogue's order
  pieces: { areaId: string; build: GameDataBuild }[];
  // What holds the region back when it does not qualify, its refused areas and its outline-less ones
  reason: string;
}
