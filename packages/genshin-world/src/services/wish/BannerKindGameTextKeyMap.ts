import { BannerKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// Each kind of wish by the game's own name for it
export const BannerKindGameTextKeyMap = {
  [BannerKind.Beginners]: GameTextKey.WishBeginners,
  [BannerKind.CharacterEvent]: GameTextKey.WishCharacterEvent,
  [BannerKind.Standard]: GameTextKey.WishStandard,
  [BannerKind.WeaponEvent]: GameTextKey.WishWeaponEvent,
} as const satisfies Record<BannerKind, GameTextKey>;
