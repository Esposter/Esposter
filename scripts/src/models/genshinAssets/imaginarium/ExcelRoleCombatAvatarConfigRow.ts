// The fields read off one row of the game's Imaginarium Theater avatar config table: the id a schedule row joins it by, the
// Element codes of a season's three elements with a trailing 0, the six opening characters' avatar ids and the four special
// Guests' avatar ids. The dump scrambles every key, so each is read under the key the dump holds at 7.1
export interface ExcelRoleCombatAvatarConfigRow {
  avatarConfigId: number;
  FKFHFHFGMEM: number[];
  FMNCKJDCADH: number[];
  MFNFDFPOAMC: number[];
}
