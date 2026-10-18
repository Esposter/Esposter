import { GameDataset } from "#src/models/data/GameDataset";

// The hosted key of one piece of a region's ground: a region is fitted in pieces, one per area its catalogue outlines,
// And each piece is a record of its own, so a piece is read only once its area comes within reach
export const getRegionGroundPieceKey = (region: string, areaId: string): string =>
  `${GameDataset.Ground}/${region}/${areaId}`;
