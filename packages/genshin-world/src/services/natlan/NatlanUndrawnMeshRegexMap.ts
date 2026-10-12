import { UNDRAWN_EFFECTS_MESH_REGEX, UNDRAWN_STAGE_PLANES_MESH_REGEX } from "#src/services/constants";

// The rest of the People of the Springs' exports, which the world does not draw yet, one entry a kind of mesh: with
// The families, every renderer of the capital's witness is claimed
export const NatlanUndrawnMeshRegexMap: Record<string, RegExp> = {
  effects: UNDRAWN_EFFECTS_MESH_REGEX,
  lights: /^Area_Nt_Light_/u,
  plants: /^Area_Nt_(?:Botany|Grass)_/u,
  plot: /^Area_Nt_Plot_/u,
  props: /^(?:Area_(?:Common|Fd|Nt)_Prop|Stages_Props)_/u,
  rocks: /^Area_Nt_Rock_/u,
  stagePlanes: UNDRAWN_STAGE_PLANES_MESH_REGEX,
};
