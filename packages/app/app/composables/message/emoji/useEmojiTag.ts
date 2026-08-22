import { DELETED_EMOJI_DESCRIPTION } from "@/services/message/emoji/constants";
import { getEmojiDescription } from "@/services/message/emoji/getEmojiDescription";
import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { parseCustomEmojiId } from "@/services/message/emoji/parseCustomEmojiId";
import { useRoomEmojiStore } from "@/store/message/room/emoji";

// One resolution of a stored reaction tag, read by everything that renders one: which of the room's uploads it
// Names, and the label the hover card and the reactions dialog read. A tag whose emoji has been deleted resolves
// To nothing and reads as its own fallback rather than as another room's emoji
export const useEmojiTag = (emojiTag: MaybeRefOrGetter<string>) => {
  const roomEmojiStore = useRoomEmojiStore();
  const { customEmojiMap } = storeToRefs(roomEmojiStore);
  const customEmojiId = computed(() => parseCustomEmojiId(toValue(emojiTag)));
  const customEmoji = computed(() => (customEmojiId.value ? customEmojiMap.value.get(customEmojiId.value) : undefined));
  const description = computed(() => {
    if (!customEmojiId.value) return getEmojiDescription(toValue(emojiTag));
    return customEmoji.value ? getEmojiShortcode(customEmoji.value.name) : DELETED_EMOJI_DESCRIPTION;
  });
  return { customEmoji, customEmojiId, description };
};
