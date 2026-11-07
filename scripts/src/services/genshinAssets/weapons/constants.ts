import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The weapon icons exported from the installed game, each a PNG under the icon name the weapon table gives it, kept
// Outside the repository like every other export and never shipped
export const WEAPON_ICON_DIRECTORY: string = join(EXTRACTED_DIRECTORY, "weapons", "icons");
// A held weapon's mesh in the asset index, named by its kind and the weapon, and an animator of a prefab holding one: the
// Blocks they lie in are the ones whose layouts the roots are read from. The effect meshes are named otherwise
export const HELD_WEAPON_MESH_REGEX: RegExp = /^Equip_(?:Bow|Catalyst|Claymore|Pole|Sword)_.+_Model$/u;
export const HELD_WEAPON_ANIMATOR_REGEX: RegExp = /^Equip_(?:Bow|Catalyst|Claymore|Pole|Sword)_/u;
// The roots the derivation found, committed beside the component map that reads them
export const WEAPON_ROOTS_PATH: string = join(import.meta.dirname, "..", "shared", "weaponRoots.json");
// An icon is traced on a grid of cells this many texels wide, a texel counting as painted above this alpha, and its loops
// Simplified to within this many cells
export const WEAPON_ICON_TRACE_TEXELS = 4;
export const WEAPON_ICON_COVERAGE_THRESHOLD = 0.5;
export const WEAPON_ICON_TRACE_TOLERANCE = 1;
