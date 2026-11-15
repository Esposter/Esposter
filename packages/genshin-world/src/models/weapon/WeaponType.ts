// The five kinds of weapon, a character wielding only its own kind, each spelt as the game's tables spell it
export const WeaponType = {
  Bow: "WEAPON_BOW",
  Catalyst: "WEAPON_CATALYST",
  Claymore: "WEAPON_CLAYMORE",
  Polearm: "WEAPON_POLE",
  Sword: "WEAPON_SWORD_ONE_HAND",
} as const;
export type WeaponType = (typeof WeaponType)[keyof typeof WeaponType];
