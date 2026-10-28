import type { ExcelRoleCombatAvatarConfigRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRow";

import { ExcelRoleCombatAvatarConfigRowFieldDumpKey } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRowFieldDumpKey";

// Each field of an avatar config row under the key the 7.1 dump holds it at, the scrambled keys named by their evidence
export const ExcelRoleCombatAvatarConfigRowFieldDumpKeyMap: Readonly<
  Record<keyof ExcelRoleCombatAvatarConfigRow, string>
> = {
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.AvatarConfigId]: "avatarConfigId",
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.ElementCodes]: "FMNCKJDCADH",
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.OpeningCharacterIds]: "MFNFDFPOAMC",
  [ExcelRoleCombatAvatarConfigRowFieldDumpKey.SpecialGuestIds]: "FKFHFHFGMEM",
};
