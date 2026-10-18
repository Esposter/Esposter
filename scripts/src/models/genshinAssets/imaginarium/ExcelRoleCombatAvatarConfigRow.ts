// The fields read off one row of the game's Imaginarium Theater avatar config table: the id a schedule row joins it by, the
// Element codes of a season's three elements with a trailing 0, the six opening characters' avatar ids and the four special
// Guests' avatar ids. The dump scrambles every key, so each is read under the key the dump holds at 7.1, named here by what
// Its values are: `elementCodes` is `FMNCKJDCADH` (its codes read the three elements of each of the 29 seasons on the wiki),
// `openingCharacterIds` is `MFNFDFPOAMC` (six in each of those seasons, the wiki's six openers by name) and `specialGuestIds`
// Is `FKFHFHFGMEM` (four in each, the wiki's guests by name)
export interface ExcelRoleCombatAvatarConfigRow {
  avatarConfigId: number;
  elementCodes: number[];
  openingCharacterIds: number[];
  specialGuestIds: number[];
}
