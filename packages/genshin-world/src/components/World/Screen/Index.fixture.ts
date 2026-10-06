import TerrainTileWorker from "#src/workers/terrainTile.worker?worker";
import { QualityTier } from "genshin-engine";

// Windrise at its first hour, drawn every frame, so the visual suite's screenshot never settles on it. The world has no
// Reference of the game's yet, so it is on the page to be looked at and shot, never approved. The page's root is the
// Package, so its region data is served from where it is kept
export const isMotionOnly = true;
export const props = {
  createTerrainWorker: () => new TerrainTileWorker(),
  qualityTier: QualityTier.High,
  regionDataBaseUrl: "src/data/regions",
};
export const readyEvent = "ready";
