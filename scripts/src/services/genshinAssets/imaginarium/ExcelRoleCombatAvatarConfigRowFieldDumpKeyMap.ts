import type { ExcelRoleCombatAvatarConfigRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatAvatarConfigRow";

// Each field of an avatar config row under the key the 7.1 dump holds it at, the scrambled keys named by their evidence
export const ExcelRoleCombatAvatarConfigRowFieldDumpKeyMap = {
  avatarConfigId: "avatarConfigId",
  elementCodes: "FMNCKJDCADH",
  openingCharacterIds: "MFNFDFPOAMC",
  specialGuestIds: "FKFHFHFGMEM",
} as const satisfies Record<keyof ExcelRoleCombatAvatarConfigRow, string>;
