// Whether a prefab's name is a building's: named by a building family, `Build_` as in `Area_Common_Build_`, `Area_MdBuild_`
// Or `Area_Ly_Build_`, or `Stages_Build`, and not a prop, a plant, an effect or a decal, which the same families name too
const ARCHITECTURE_NAME_REGEX = /Build_|Stages_Build/u;
const NON_ARCHITECTURE_NAME_REGEX = /Prop|Plant|Tree|Flower|Grass|Bush|^Eff_|Effect|Decal/u;

export const checkIsArchitectureName = (name: string): boolean =>
  ARCHITECTURE_NAME_REGEX.test(name) && !NON_ARCHITECTURE_NAME_REGEX.test(name);
