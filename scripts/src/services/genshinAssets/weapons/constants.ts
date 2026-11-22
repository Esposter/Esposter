/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation */
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The weapon icons exported from the installed game, each a PNG under the icon name the weapon table gives it, kept
// Outside the repository like every other export and never shipped
export const WEAPON_ICON_DIRECTORY: string = join(EXTRACTED_DIRECTORY, "weapons", "icons");
// A held weapon's mesh in the asset index, named by its kind and the weapon, and an animator of a prefab holding one:
// The blocks they lie in are the ones whose layouts the roots are read from. The effect meshes are named otherwise
export const HELD_WEAPON_ANIMATOR_REGEX: RegExp = /^Equip_(?:Bow|Catalyst|Claymore|Pole|Sword)_/u;
export const HELD_WEAPON_MESH_REGEX: RegExp = new RegExp(`${HELD_WEAPON_ANIMATOR_REGEX.source}.+_Model$`, "u");
// The roots the derivation found, the one generated file the component map reads whole
export const WEAPON_ROOTS_PATH: string = join(REPOSITORY_ROOT, "scripts", "src", "generated", "weaponRoots.json");
