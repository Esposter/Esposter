// The game's meshes round Sumeru City that the scene does not draw yet, by kind, under any region's code where the
// Export borrows another's: with its families, every renderer of its exports is claimed once (the inventory pass)
export const SumeruUndrawnMeshRegexMap: Record<string, RegExp> = {
  bridges: /^Area_Xm_Bridge_/u,
  commonBuildings: /^Area_Common_Build_/u,
  dungeon: /^Level_PfDungeon_/u,
  effects: /^Eff_/u,
  lights: /^Area_[A-Za-z]+_Light_/u,
  plants: /^(?:Area_[A-Za-z]+_(?:BroadLeaf|Grass|Lvy|Tree)_|Stages_(?:LYLvy|Lvy))/u,
  plot: /^Area_[A-Za-z]+_(?:Plot|Stairs)_/u,
  props: /^(?:Area_[A-Za-z]+_Prop_|Stages_Props_)/u,
  rocks: /^Area_Xm_Stone_/u,
  stagePlanes: /^Stages_(?:DecalCube|Plane)_/u,
};
