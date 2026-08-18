import type { EmojiCategory } from "@/models/message/emoji/EmojiCategory";

import { EmojiGroups } from "@/models/message/emoji/EmojiGroup";
import { RECENT_EMOJI_CATEGORY_ICON, RECENT_EMOJI_CATEGORY_TITLE } from "@/services/message/emoji/constants";
import { EmojiGroupIconMap } from "@/services/message/emoji/EmojiGroupIconMap";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";

// Frequently Used is pinned ahead of the CLDR groups when it has anything in it, which is where Discord puts
// It. Recents are stored as slugs rather than characters so they survive a change of skin tone, and a slug
// The index no longer knows drops out here rather than rendering as its own text
export const getEmojiCategories = (recentEmojiSlugs: string[]): EmojiCategory[] => {
  const { byGroup, bySlug } = getEmojiIndex();
  const recentEmojis = recentEmojiSlugs.flatMap((recentEmojiSlug) => {
    const emoji = bySlug.get(recentEmojiSlug);
    return emoji ? [emoji] : [];
  });
  const groupCategories = EmojiGroups.map((group) => ({
    emojis: byGroup.get(group) ?? [],
    icon: EmojiGroupIconMap[group],
    title: group,
  }));
  if (recentEmojis.length === 0) return groupCategories;
  return [
    { emojis: recentEmojis, icon: RECENT_EMOJI_CATEGORY_ICON, title: RECENT_EMOJI_CATEGORY_TITLE },
    ...groupCategories,
  ];
};
