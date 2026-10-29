import { WeaponType } from "#src/models/weapon/WeaponType";
import { GameTextKey } from "genshin-text";

// Each kind of weapon by the game's own word for it, as the weapon screen's band names the chosen weapon's kind
export const WeaponTypeNameGameTextKeyMap = {
  [WeaponType.Bow]: GameTextKey.WeaponTypeBow,
  [WeaponType.Catalyst]: GameTextKey.WeaponTypeCatalyst,
  [WeaponType.Claymore]: GameTextKey.WeaponTypeClaymore,
  [WeaponType.Polearm]: GameTextKey.WeaponTypePolearm,
  [WeaponType.Sword]: GameTextKey.WeaponTypeSword,
} as const satisfies Record<WeaponType, GameTextKey>;
