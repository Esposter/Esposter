export const ExcelRoleCombatAvatarConfigRowFieldDumpKey = {
  AvatarConfigId: "avatarConfigId",
  ElementCodes: "elementCodes",
  OpeningCharacterIds: "openingCharacterIds",
  OpeningTrialIds: "openingTrialIds",
  SpecialGuestIds: "specialGuestIds",
} as const;
export type ExcelRoleCombatAvatarConfigRowFieldDumpKey =
  (typeof ExcelRoleCombatAvatarConfigRowFieldDumpKey)[keyof typeof ExcelRoleCombatAvatarConfigRowFieldDumpKey];
