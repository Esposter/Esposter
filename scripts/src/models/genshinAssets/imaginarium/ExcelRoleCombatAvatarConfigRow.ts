import type { ExcelRoleCombatAvatarConfigRowFieldDumpKey } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRowFieldDumpKey";

// The fields read off one row of the game's Imaginarium Theater avatar config table: the id a schedule row joins it by, the
// Element codes of a season's three elements with a trailing 0, the six opening characters' avatar ids, the six trial avatar
// Ids those openers play as and the four special guests' avatar ids. The dump scrambles every key, so each is read under the
// Key the dump holds at 7.1, named here by what its values are: `elementCodes` is `FMNCKJDCADH` (its codes read the three
// Elements of each of the 29 seasons on the wiki), `openingCharacterIds` is `MFNFDFPOAMC` (six in each of those seasons, the
// Wiki's six openers by name), `openingTrialIds` is `GCLLBFHCLFK` (six in each of the 30 config rows, each a trial avatar whose
// Character is that season's opener) and `specialGuestIds` is `FKFHFHFGMEM` (four in each, the wiki's guests by name)
export interface ExcelRoleCombatAvatarConfigRow {
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.AvatarConfigId]: number;
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.ElementCodes]: number[];
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.OpeningCharacterIds]: number[];
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.OpeningTrialIds]: number[];
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.SpecialGuestIds]: number[];
}
