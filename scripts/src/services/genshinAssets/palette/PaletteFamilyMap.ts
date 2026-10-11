import { PaletteRegion } from "#src/models/genshinAssets/palette/PaletteRegion";

// Each region's kit fields and the texture families that feed them, a family named as its diffuse texture is without
// Its suffix. A family is a texture a field's part tiles with, never an atlas whose largest cluster is another part's:
// Mondstadt's and Inazuma's plaster is a panel in a trim atlas, and the extractions hold neither Mondstadt's roofs nor a
// Building of Snezhnaya's, so those fields are left out and their provisional colours stay
export const PaletteFamilyMap: Record<PaletteRegion, Record<string, string[]>> = {
  [PaletteRegion.Inazuma]: {
    roofTile: ["Area_Dq_Build_MS_TsgRoof_01_T2", "Area_Dq_Build_MS_CityHouse_01_T2"],
    // The castle town's frame timber, not the common planks of its boardwalks
    timber: ["Area_Dq_Build_Common_TsgWood_01_T4"],
  },
  [PaletteRegion.Liyue]: {
    lacquer: [
      "Area_Ly_Build_LYG_Common_Wood_02_T2",
      "Area_Ly_Build_LYG_Common_Wood_04_T2",
      "Area_Ly_Build_LYG_Common_Wall_03_T2",
    ],
    roof: ["Area_Ly_Build_Common_Glazed_03_T4"],
    stone: [
      "Area_Ly_Build_LYG_Common_Edge_01_T2",
      "Area_Ly_Build_LYG_Common_Wall_04_T2",
      "Area_Ly_Build_Common_Rock_01",
      "Area_Ly_Build_LYG_Common_Parts_01",
    ],
  },
  [PaletteRegion.Mondstadt]: {
    stone: [
      "Area_MdBuild_SdWall06",
      "Area_MdBuild_SdEdge02",
      "Area_Mdbuild_Wall05B",
      "Area_Mdbuild_Edge01",
      "Area_MdBuild_Column01",
    ],
    timber: ["Area_Dq_Build_Common_Wood_03_T2", "Stages_Wood_Pillar_01_T2", "Stages_Wood_Pillar_02_T2"],
  },
  [PaletteRegion.Natlan]: {
    building: ["Area_Nt_Build_Common_Zhandao_01", "Area_Nt_Build_YLL_Baobian_02_T2", "Area_Nt_Build_YLL_Wood_01_T4"],
  },
  [PaletteRegion.NodKrai]: {
    iron: [
      "Area_Ndkl_Build_Common_Jiazi_01",
      "Area_Ndkl_Build_NXZ_Tiepi_01_T4",
      "Area_Ndkl_Build_BGC_Jiegou_01_T2",
      "Area_Ndkl_Build_Common_Dianti_01",
    ],
  },
  [PaletteRegion.Sumeru]: {
    // The plots the city's tiers stand on
    terrace: [
      "Area_Xm_Plot_XKC_01_T4",
      "Area_Xm_Plot_XKC_02_T4",
      "Area_Xm_Plot_XKC_03_T2",
      "Area_Xm_Plot_XKC_04_T2",
      "Area_Xm_Plot_XKC_05_T2",
      "Area_Xm_Plot_XKC_08",
    ],
  },
};
