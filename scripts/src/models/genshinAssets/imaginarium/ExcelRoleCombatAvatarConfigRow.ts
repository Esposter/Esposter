import type { ExcelRoleCombatAvatarConfigRowFieldDumpKey } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRowFieldDumpKey";

// The fields read off one row of the game's Imaginarium Theater avatar config table: the id a schedule row joins it by,
// The element codes of a season's three elements with a trailing 0, the six opening characters' avatar ids, the six
// Trial avatar ids those openers play as and the four special guests' avatar ids. The dump scrambles every key, so each
// Is read under the key the dump holds at 7.1, named here by what its values are: `elementCodes` is `FMNCKJDCADH` (its
// Codes read the three elements of each of the 29 seasons on the wiki), `openingCharacterIds` is `MFNFDFPOAMC` (six in
// Each of those seasons, the wiki's six openers by name), `openingTrialIds` is `GCLLBFHCLFK` (six in each of the 30
// Config rows, each a trial avatar whose character is that season's opener) and `specialGuestIds` is `FKFHFHFGMEM`
// (four in each, the wiki's guests by name)
export interface ExcelRoleCombatAvatarConfigRow {
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.AvatarConfigId]: number;
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.ElementCodes]: number[];
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.OpeningCharacterIds]: number[];
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.OpeningTrialIds]: number[];
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.SpecialGuestIds]: number[];
}
