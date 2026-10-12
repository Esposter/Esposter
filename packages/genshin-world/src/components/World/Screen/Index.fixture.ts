import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { FontainePartFamilyMeshRegexMap } from "#src/services/fontaine/FontainePartFamilyMeshRegexMap";
import { FontaineUndrawnMeshRegexMap } from "#src/services/fontaine/FontaineUndrawnMeshRegexMap";
import { InazumaPartFamilyMeshRegexMap } from "#src/services/inazuma/InazumaPartFamilyMeshRegexMap";
import { InazumaUndrawnMeshRegexMap } from "#src/services/inazuma/InazumaUndrawnMeshRegexMap";
import { LiyuePartFamilyMeshRegexMap } from "#src/services/liyue/LiyuePartFamilyMeshRegexMap";
import { LiyueUndrawnMeshRegexMap } from "#src/services/liyue/LiyueUndrawnMeshRegexMap";
import { MondstadtPartFamilyMeshRegexMap } from "#src/services/mondstadt/MondstadtPartFamilyMeshRegexMap";
import { MondstadtUndrawnMeshRegexMap } from "#src/services/mondstadt/MondstadtUndrawnMeshRegexMap";
import { NatlanPartFamilyMeshRegexMap } from "#src/services/natlan/NatlanPartFamilyMeshRegexMap";
import { NatlanUndrawnMeshRegexMap } from "#src/services/natlan/NatlanUndrawnMeshRegexMap";
import { NodKraiPartFamilyMeshRegexMap } from "#src/services/nod-krai/NodKraiPartFamilyMeshRegexMap";
import { NodKraiUndrawnMeshRegexMap } from "#src/services/nod-krai/NodKraiUndrawnMeshRegexMap";
import { SnezhnayaPartFamilyMeshRegexMap } from "#src/services/snezhnaya/SnezhnayaPartFamilyMeshRegexMap";
import { SnezhnayaUndrawnMeshRegexMap } from "#src/services/snezhnaya/SnezhnayaUndrawnMeshRegexMap";
import { SumeruPartFamilyMeshRegexMap } from "#src/services/sumeru/SumeruPartFamilyMeshRegexMap";
import { SumeruUndrawnMeshRegexMap } from "#src/services/sumeru/SumeruUndrawnMeshRegexMap";
import { WindrisePartFamilyMeshRegexMap } from "#src/services/windrise/WindrisePartFamilyMeshRegexMap";
import TerrainTileWorker from "#src/workers/terrainTile.worker?worker";
import { QualityTier } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// Windrise at its first hour, drawn every frame, so the visual suite's screenshot never settles on it. No reference of
// The game's compares clean on it yet, so it is on the page to be looked at and shot, never approved. The region data is
// Served from the parity page's public directory, which is its `src/data`
export const isMotionOnly = true;
export const props = {
  createTerrainWorker: () => new TerrainTileWorker(),
  gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  qualityTier: QualityTier.High,
  regionDataBaseUrl: "regions",
};
export const readyEvent = "ready";
// Windrise's claims on its exports, and each capital's own on its region's, so no renderer of theirs falls to
// Windrise's families, whose terrain tiles and common ruins their exports hold too
export const witnessComponents = {
  fontaine: { witnessFamilies: FontainePartFamilyMeshRegexMap, witnessUndrawn: FontaineUndrawnMeshRegexMap },
  inazuma: { witnessFamilies: InazumaPartFamilyMeshRegexMap, witnessUndrawn: InazumaUndrawnMeshRegexMap },
  liyue: { witnessFamilies: LiyuePartFamilyMeshRegexMap, witnessUndrawn: LiyueUndrawnMeshRegexMap },
  mondstadt: { witnessFamilies: MondstadtPartFamilyMeshRegexMap, witnessUndrawn: MondstadtUndrawnMeshRegexMap },
  natlan: { witnessFamilies: NatlanPartFamilyMeshRegexMap, witnessUndrawn: NatlanUndrawnMeshRegexMap },
  "nod-krai": { witnessFamilies: NodKraiPartFamilyMeshRegexMap, witnessUndrawn: NodKraiUndrawnMeshRegexMap },
  snezhnaya: { witnessFamilies: SnezhnayaPartFamilyMeshRegexMap, witnessUndrawn: SnezhnayaUndrawnMeshRegexMap },
  sumeru: { witnessFamilies: SumeruPartFamilyMeshRegexMap, witnessUndrawn: SumeruUndrawnMeshRegexMap },
  windrise: { witnessFamilies: WindrisePartFamilyMeshRegexMap },
};
