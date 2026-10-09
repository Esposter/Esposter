import {
  AVATAR_ICON_PREFIX,
  NAMECARD_ICON_PREFIX,
  NAMECARDLESS_AVATAR_IDS,
} from "#src/services/genshinAssets/profile/constants";

// The namecard of a character: its avatar icon's name with the namecard prefix in place of the avatar one, and none for the
// Few playable characters the game gives no namecard
export const getNamecardIconName = (avatarId: number, avatarIconName: string): string => {
  if (!avatarIconName.startsWith(AVATAR_ICON_PREFIX) || NAMECARDLESS_AVATAR_IDS.includes(avatarId)) return "";
  return `${NAMECARD_ICON_PREFIX}${avatarIconName.slice(AVATAR_ICON_PREFIX.length)}`;
};
