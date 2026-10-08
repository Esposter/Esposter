import { WindrisePartFamilyMeshRegexMap } from "#src/services/windrise/WindrisePartFamilyMeshRegexMap";
import TerrainTileWorker from "#src/workers/terrainTile.worker?worker";
import { QualityTier } from "genshin-engine";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Windrise at its first hour, drawn every frame, so the visual suite's screenshot never settles on it. No reference of
// The game's compares clean on it yet, so it is on the page to be looked at and shot, never approved. The page's root is the
// Package, so its region data is served from where it is kept
export const isMotionOnly = true;
export const props = {
  createTerrainWorker: () => new TerrainTileWorker(),
  gameText: ENGLISH_GAME_TEXT,
  qualityTier: QualityTier.High,
  regionDataBaseUrl: "src/data/regions",
};
export const readyEvent = "ready";
export const witnessFamilies = WindrisePartFamilyMeshRegexMap;
