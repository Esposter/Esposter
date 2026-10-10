// Whether a prefab's name is a plant's: named by a plant family, a tree, bush, shrub, plant, flower or grass, and not an
// Effect, a decal, a drop or a flowerpot, which the same families name too
const PLANT_NAME_REGEX = /Tree|Bush|Shrub|Plant|Flower|Grass/u;
const NON_PLANT_NAME_REGEX = /^Eff_|Effect|Decal|^Item_|[Pp]ot/u;

export const checkIsPlantName = (name: string): boolean =>
  PLANT_NAME_REGEX.test(name) && !NON_PLANT_NAME_REGEX.test(name);
