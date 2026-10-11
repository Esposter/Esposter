import { PaletteRegion } from "#src/models/genshinAssets/palette/PaletteRegion";

// Each region's kit fields and the building material families that feed them, a family named as its material is. A
// Field with no family in the extraction is left out, and its provisional colour stays
export const PaletteFamilyMap: Record<PaletteRegion, Record<string, string[]>> = {
  [PaletteRegion.Liyue]: {
    lacquer: [
      "Stages_Wood_Pillar_04_T2",
      "Stages_Wood_Pillar_05_T2",
      "Stages_Wood_Pillar_06_T2",
      "Stages_Wood_Pillar_08_T2",
    ],
    roof: ["Area_Ly_Build_Common_Glazed_03_T4"],
    stone: [
      "Area_Ly_Build_LYG_Common_Wall_03_T2",
      "Area_Ly_Build_Common_Rock_01",
      "Area_Ly_Build_LYG_Common_Parts_01",
      "Area_Ly_Build_LYG_Common_Parts_02",
    ],
  },
  [PaletteRegion.Mondstadt]: {
    plaster: ["Area_MdBuild_House_Wall06"],
    stone: [
      "Area_MdBuild_SdWall06",
      "Area_MdBuild_SdEdge02",
      "Area_Mdbuild_Wall05B",
      "Area_Mdbuild_Wall05C",
      "Area_Mdbuild_Edge01",
      "Area_MdBuild_Column01",
    ],
    timber: ["Area_Dq_Build_Common_Wood_03_T2", "Stages_Wood_Pillar_01_T2", "Stages_Wood_Pillar_02_T2"],
  },
};
