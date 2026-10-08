// Whether a prefab's name is a building's: named by one of the building families (`_Build_`, `Stages_Build`), and not a
// Prop, a plant, an effect or a decal, which the same families name too
const ARCHITECTURE_NAME_PATTERN = /_Build_|Stages_Build/;
const NON_ARCHITECTURE_NAME_PATTERN = /Prop|Plant|Tree|Flower|Grass|Bush|^Eff_|Effect|Decal/;

export const isArchitectureName = (name: string): boolean =>
  ARCHITECTURE_NAME_PATTERN.test(name) && !NON_ARCHITECTURE_NAME_PATTERN.test(name);
