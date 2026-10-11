import { FontainePartFamily } from "#src/models/fontaine/FontainePartFamily";
import { InazumaPartFamily } from "#src/models/inazuma/InazumaPartFamily";
import { LiyuePartFamily } from "#src/models/liyue/LiyuePartFamily";
import { MondstadtPartFamily } from "#src/models/mondstadt/MondstadtPartFamily";
import { NatlanPartFamily } from "#src/models/natlan/NatlanPartFamily";
import { NodKraiPartFamily } from "#src/models/nod-krai/NodKraiPartFamily";
import { SumeruPartFamily } from "#src/models/sumeru/SumeruPartFamily";
import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";
import { FontainePartFamilyMeshRegexMap } from "#src/services/fontaine/FontainePartFamilyMeshRegexMap";
import { InazumaPartFamilyMeshRegexMap } from "#src/services/inazuma/InazumaPartFamilyMeshRegexMap";
import { LiyuePartFamilyMeshRegexMap } from "#src/services/liyue/LiyuePartFamilyMeshRegexMap";
import { MondstadtPartFamilyMeshRegexMap } from "#src/services/mondstadt/MondstadtPartFamilyMeshRegexMap";
import { NatlanPartFamilyMeshRegexMap } from "#src/services/natlan/NatlanPartFamilyMeshRegexMap";
import { NodKraiPartFamilyMeshRegexMap } from "#src/services/nod-krai/NodKraiPartFamilyMeshRegexMap";
import { SumeruPartFamilyMeshRegexMap } from "#src/services/sumeru/SumeruPartFamilyMeshRegexMap";
import { WINDRISE_SCENE_EXPORT_COMPONENT } from "#src/services/windrise/constants";
import { WindrisePartFamilyMeshRegexMap } from "#src/services/windrise/WindrisePartFamilyMeshRegexMap";

// The families of each component's exports the world draws in place of its stand-ins, by the component's folder, which
// Is Windrise's or a region's id: Windrise's oak, paving and statue, and each capital's buildings. The ground stays ours
// Everywhere, since its exports hold each terrain tile's far base map alone, none of the layers painted over it near,
// And the body walks on our heights and the grass grows on our tiles; Windrise's exports place no grass, and
// Snezhnaya's no building of its capital yet, so it is drawn from its stand-ins alone
export const WorldSceneExportFamilyMeshRegexMap: Record<string, Record<string, RegExp>> = {
  fontaine: { [FontainePartFamily.Buildings]: FontainePartFamilyMeshRegexMap[FontainePartFamily.Buildings] },
  inazuma: { [InazumaPartFamily.Buildings]: InazumaPartFamilyMeshRegexMap[InazumaPartFamily.Buildings] },
  liyue: { [LiyuePartFamily.Buildings]: LiyuePartFamilyMeshRegexMap[LiyuePartFamily.Buildings] },
  mondstadt: { [MondstadtPartFamily.Buildings]: MondstadtPartFamilyMeshRegexMap[MondstadtPartFamily.Buildings] },
  natlan: { [NatlanPartFamily.Buildings]: NatlanPartFamilyMeshRegexMap[NatlanPartFamily.Buildings] },
  "nod-krai": { [NodKraiPartFamily.Buildings]: NodKraiPartFamilyMeshRegexMap[NodKraiPartFamily.Buildings] },
  sumeru: { [SumeruPartFamily.Buildings]: SumeruPartFamilyMeshRegexMap[SumeruPartFamily.Buildings] },
  [WINDRISE_SCENE_EXPORT_COMPONENT]: {
    [WindrisePartFamily.Oak]: WindrisePartFamilyMeshRegexMap[WindrisePartFamily.Oak],
    [WindrisePartFamily.Paving]: WindrisePartFamilyMeshRegexMap[WindrisePartFamily.Paving],
    [WindrisePartFamily.Statue]: WindrisePartFamilyMeshRegexMap[WindrisePartFamily.Statue],
  },
};
