// The rest of Mondstadt City's exports, which the world does not draw yet, one entry a kind of mesh: with the families,
// Every renderer of the capital's witness is claimed
export const MondstadtUndrawnMeshRegexMap: Record<string, RegExp> = {
  commonBuildings: /^(?:Area_(?:Common|Dq)_Build_|Stages_Build_)/u,
  dungeon: /^Level_MdDungeon_/u,
  effects: /^(?:Area_Common_Effect_|Eff_|WaterfallRipple)/u,
  items: /^Item_/u,
  lights: /^Area_Common_Light_/u,
  plants: /^(?:Grass_Reed_|Stages_(?:Deadbush|LYLvy|MdLGrass|SGrass))/u,
  props: /^(?:Area_(?:Common_Prop|Md_Prop|ManorProps|MdProps)|Indoor_MdProps|Stages_Props)_/u,
  rocks: /^Stages_MDSRock/u,
  stagePlanes: /^Stages_(?:DecalCube|Plane)_/u,
};
