import { Element } from "genshin-world";

// The Imaginarium Theater's three tables in the dump, read by their names
export const ROLE_COMBAT_SCHEDULE_TABLE_NAME = "RoleCombatScheduleExcelConfigData";
export const ROLE_COMBAT_DIFFICULTY_TABLE_NAME = "RoleCombatDifficultyExcelConfigData";
export const ROLE_COMBAT_AVATAR_CONFIG_TABLE_NAME = "RoleCombatAvatarConfigExcelConfigData";
// The element codes a season's avatar config row holds for its three elements, each the game's own code for an element. The
// Code 0 is the row's trailing slot with no element, which a season does not read
export const ElementCodeElementMap: ReadonlyMap<number, Element> = new Map([
  [2, Element.Pyro],
  [3, Element.Hydro],
  [4, Element.Dendro],
  [5, Element.Electro],
  [6, Element.Cryo],
  [7, Element.Anemo],
  [8, Element.Geo],
]);
