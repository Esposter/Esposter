// The rest of Liyue Harbor's exports, which the world does not draw yet, one entry a kind of mesh: with the families,
// Every renderer of the capital's witness is claimed
export const LiyueUndrawnMeshRegexMap: Record<string, RegExp> = {
  ajar: /^Area_Ly_Ajar_/u,
  commonBuildings: /^(?:Area_Common_(?:Build|Stairs)_|Stages_Build_)/u,
  dungeon: /^Level_(?:Md|Pf)Dungeon_/u,
  effects: /^(?:Area_Common_Effect_|Eff_)/u,
  items: /^Item_/u,
  lights: /^Area_(?:Common|Ly)_Light_/u,
  plants:
    /^(?:Area_(?:Common|Ly)_(?:Flower|Grass)_|Stages_(?:Deadbush|LYLvy|Lvy_|MGrass|MapleGrass|MdGrass_|MdSGrass|SGrass))/u,
  plot: /^Area_Ly_(?:Plot|Stairs)_/u,
  props: /^(?:Area_(?:Common_Prop|Ly_Props?|MdProps)|Indoor_Ly_Prop|Stages_Props)_/u,
  rocks: /^(?:Area_Ly_(?:Rock|Stone)_|Stages_MDSRock)/u,
  stagePlanes: /^Stages_(?:DecalCube|Plane)_/u,
  trees: /^(?:Area_Ly_Tree_|Stages_(?:CyTree|Deadwood))/u,
  water: /^Area_Ly_Water_/u,
};
