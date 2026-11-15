export const DungeonEntryTypeDomainKind = {
  DungeonEntryTypeAvatarTalent: "DUNGEN_ENTRY_TYPE_AVATAR_TALENT",
  DungeonEntryTypeReliquary: "DUNGEN_ENTRY_TYPE_RELIQUARY",
  DungeonEntryTypeWeaponPromote: "DUNGEN_ENTRY_TYPE_WEAPON_PROMOTE",
} as const;
export type DungeonEntryTypeDomainKind = (typeof DungeonEntryTypeDomainKind)[keyof typeof DungeonEntryTypeDomainKind];
