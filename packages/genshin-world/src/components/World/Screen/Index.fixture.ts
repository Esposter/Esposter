import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LiyuePartFamilyMeshRegexMap } from "#src/services/liyue/LiyuePartFamilyMeshRegexMap";
import { LiyueUndrawnMeshRegexMap } from "#src/services/liyue/LiyueUndrawnMeshRegexMap";
import { MondstadtPartFamilyMeshRegexMap } from "#src/services/mondstadt/MondstadtPartFamilyMeshRegexMap";
import { MondstadtUndrawnMeshRegexMap } from "#src/services/mondstadt/MondstadtUndrawnMeshRegexMap";
import { NatlanPartFamilyMeshRegexMap } from "#src/services/natlan/NatlanPartFamilyMeshRegexMap";
import { NatlanUndrawnMeshRegexMap } from "#src/services/natlan/NatlanUndrawnMeshRegexMap";
import { SnezhnayaPartFamilyMeshRegexMap } from "#src/services/snezhnaya/SnezhnayaPartFamilyMeshRegexMap";
import { SnezhnayaUndrawnMeshRegexMap } from "#src/services/snezhnaya/SnezhnayaUndrawnMeshRegexMap";
import { WindrisePartFamilyMeshRegexMap } from "#src/services/windrise/WindrisePartFamilyMeshRegexMap";
import TerrainTileWorker from "#src/workers/terrainTile.worker?worker";
import { QualityTier } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// Windrise at its first hour, drawn every frame, so the visual suite's screenshot never settles on it. No reference of
// The game's compares clean on it yet, so it is on the page to be looked at and shot, never approved. The page's root is the
// Package, so its region data is served from where it is kept
export const isMotionOnly = true;
export const props = {
  createTerrainWorker: () => new TerrainTileWorker(),
  gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  qualityTier: QualityTier.High,
  regionDataBaseUrl: "src/data/regions",
};
export const readyEvent = "ready";
// Each capital's own claims on its region's exports, so no renderer of theirs falls to Windrise's families below, whose
// Terrain tiles and common ruins their exports hold too
export const witnessComponents = {
  liyue: { witnessFamilies: LiyuePartFamilyMeshRegexMap, witnessUndrawn: LiyueUndrawnMeshRegexMap },
  mondstadt: { witnessFamilies: MondstadtPartFamilyMeshRegexMap, witnessUndrawn: MondstadtUndrawnMeshRegexMap },
  natlan: { witnessFamilies: NatlanPartFamilyMeshRegexMap, witnessUndrawn: NatlanUndrawnMeshRegexMap },
  snezhnaya: { witnessFamilies: SnezhnayaPartFamilyMeshRegexMap, witnessUndrawn: SnezhnayaUndrawnMeshRegexMap },
};
export const witnessFamilies = WindrisePartFamilyMeshRegexMap;
