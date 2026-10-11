// The game's meshes round Inazuma City that the scene does not draw yet, by kind, under any region's code where the
// Export borrows another's: with its families, every renderer of its exports is claimed once (the inventory pass)
export const InazumaUndrawnMeshRegexMap: Record<string, RegExp> = {
  bridges: /^Area_[A-Za-z]+_Bridge_/u,
  cloth: /^Area_Dq_Ecloth_/u,
  commonBuildings: /^Area_Common_Build_/u,
  dungeon: /^Level_PfDungeon_/u,
  effects: /^(?:Eff_|CloudPlane|Area_Common_Effect_)/u,
  lights: /^Area_[A-Za-z]+_Light_/u,
  plants: /^(?:Area_[A-Za-z]+_(?:Flower|Grass|Lvy|Tree)_|Stages_(?:Deadbush|Lvy|MapleGrass|MdGrass))/u,
  plot: /^Area_[A-Za-z]+_(?:Plot|Stairs)_/u,
  props: /^(?:Area_[A-Za-z]+_Prop_|Area_MdProps_|Indoor_MdProps_|Stages_(?:BeachShell|Props_))/u,
  rocks: /^Area_Dq_(?:Rock|Stone)_/u,
  shops: /^Area_Dq_Ajar_/u,
  stagePlanes: /^Stages_(?:DecalCube|Plane|Quad)_/u,
};
