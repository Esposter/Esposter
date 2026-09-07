import { SkinTone } from "@/models/message/emoji/SkinTone";
import { MAX_RECENT_EMOJIS } from "@/services/message/emoji/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

// Both are per-device display preferences like the message density, so they persist in localStorage rather
// Than in the DB-backed user settings. Holding them here rather than in a module singleton is what makes the
// Recents category update the moment an emoji is picked, instead of on the next full remount
export const useEmojiPickerStore = defineStore("message/emojiPicker", () => {
  const recentEmojiSlugs = useLocalStorage<string[]>(LocalStorageKey.RecentEmojiSlugs, []);
  const skinTone = useLocalStorage<SkinTone>(LocalStorageKey.EmojiSkinTone, SkinTone.Default);
  // Most-recent-first with the previous entry removed, so picking the same emoji promotes it rather than
  // Filling the row with copies of it
  const createRecentEmojiSlug = (slug: string) => {
    recentEmojiSlugs.value = [
      slug,
      ...recentEmojiSlugs.value.filter((recentEmojiSlug) => recentEmojiSlug !== slug),
    ].slice(0, MAX_RECENT_EMOJIS);
  };
  return { createRecentEmojiSlug, recentEmojiSlugs, skinTone };
});
