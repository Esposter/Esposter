import { MondstadtPartFamily } from "#src/models/mondstadt/MondstadtPartFamily";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { LandmarkKindWindrisePartFamilyMap } from "#src/services/windrise/LandmarkKindWindrisePartFamilyMap";

// The family of the game's exports each kind of landmark stands in for: a tree Windrise's oak and a statue its statue,
// As a witness render marks them, and a building its capital's buildings, a family every region's exports name alike
export const LandmarkKindSceneExportFamilyMap: Partial<Record<LandmarkKind, string>> = {
  ...LandmarkKindWindrisePartFamilyMap,
  [LandmarkKind.Building]: MondstadtPartFamily.Buildings,
};
