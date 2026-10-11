// The game's meshes round the Court of Fontaine that the scene does not draw yet, by kind, under any region's code where
// The export borrows another's: with its families, every renderer of its exports is claimed once (the inventory pass)
export const FontaineUndrawnMeshRegexMap: Record<string, RegExp> = {
  commonBuildings: /^Area_Common_Build_/u,
  effects: /^Eff_/u,
  lights: /^Area_[A-Za-z]+_Light_/u,
  plants: /^Area_[A-Za-z]+_(?:Grass|Lvy)_/u,
  plot: /^Area_Fd_Plot_/u,
  props: /^(?:Area_[A-Za-z]+_Prop_|Property_Prop_|Stages_Props_)/u,
  rocks: /^Area_Fd_(?:Rock|Stone)_/u,
  stagePlanes: /^Stages_(?:DecalCube|Plane)_/u,
};
