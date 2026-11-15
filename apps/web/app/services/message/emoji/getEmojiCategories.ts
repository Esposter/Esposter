import type { CustomEmoji } from "#src/models/message/emoji/CustomEmoji";
import type { EmojiCategory } from "#src/models/message/emoji/EmojiCategory";
import type { PickableEmoji } from "#src/models/message/emoji/PickableEmoji";

import { EmojiGroups } from "#src/models/message/emoji/EmojiGroup";
import {
  RECENT_EMOJI_CATEGORY_ICON,
  RECENT_EMOJI_CATEGORY_TITLE,
  ROOM_EMOJI_CATEGORY_ICON,
  ROOM_EMOJI_CATEGORY_TITLE,
} from "#src/services/message/emoji/constants";
import { EmojiGroupIconMap } from "#src/services/message/emoji/EmojiGroupIconMap";
import { getEmojiIndex } from "#src/services/message/emoji/getEmojiIndex";

// Frequently Used is pinned ahead of the CLDR groups when it has anything in it, and the room's own emoji sit
// Between the two — which is where Discord puts a server's set, above every unicode category and below the
// Recents. Recents are stored as slugs rather than characters so they survive a change of skin tone, and a slug
// Neither vocabulary knows any more drops out here rather than rendering as its own text
export const getEmojiCategories = (recentEmojiSlugs: string[], customEmojis: CustomEmoji[]): EmojiCategory[] => {
  const { groupEmojisMap, slugEmojiMap } = getEmojiIndex();
  const customEmojiMap = new Map(customEmojis.map((customEmoji) => [customEmoji.slug, customEmoji]));
  const recentEmojis = recentEmojiSlugs.flatMap<PickableEmoji>((recentEmojiSlug) => {
    const emoji = customEmojiMap.get(recentEmojiSlug) ?? slugEmojiMap.get(recentEmojiSlug);
    return emoji ? [emoji] : [];
  });
  const groupCategories = EmojiGroups.map((group) => ({
    emojis: groupEmojisMap.get(group) ?? [],
    icon: EmojiGroupIconMap[group],
    title: group,
  }));
  return [
    ...(recentEmojis.length > 0
      ? [{ emojis: recentEmojis, icon: RECENT_EMOJI_CATEGORY_ICON, title: RECENT_EMOJI_CATEGORY_TITLE }]
      : []),
    ...(customEmojis.length > 0
      ? [{ emojis: customEmojis, icon: ROOM_EMOJI_CATEGORY_ICON, title: ROOM_EMOJI_CATEGORY_TITLE }]
      : []),
    ...groupCategories,
  ];
};
