import { UNDRAWN_EFFECTS_MESH_REGEX, UNDRAWN_STAGE_PLANES_MESH_REGEX } from "#src/services/constants";

// The game's meshes round Nasha Town that the scene does not draw yet, by kind, under any region's code where the
// Export borrows another's: with its families, every renderer of its exports is claimed once (the inventory pass)
export const NodKraiUndrawnMeshRegexMap: Record<string, RegExp> = {
  effects: UNDRAWN_EFFECTS_MESH_REGEX,
  lights: /^Area_Ndkl_Light_/u,
  natlanBuildings: /^Area_Nt_Build_/u,
  plants: /^Area_Ndkl_(?:Botany|Grass|Lvy|Tree)_/u,
  plot: /^Area_Ndkl_Plot_/u,
  props: /^(?:Area_[A-Za-z]+_Props?_|Area_MdProps_|Indoor_Nt_Prop_)/u,
  rocks: /^Area_[A-Za-z]+_(?:Rock|Stone)_/u,
  stagePlanes: UNDRAWN_STAGE_PLANES_MESH_REGEX,
};
