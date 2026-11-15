import type { PickableEmoji } from "#src/models/message/emoji/PickableEmoji";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import EmojiSuggestionList from "#src/components/Message/Model/Message/Suggestion/EmojiList.vue";
import { SuggestionTrigger } from "#src/models/shared/SuggestionTrigger";
import { EMOJI_SUGGESTION_MIN_QUERY_LENGTH, MAX_EMOJI_SUGGESTIONS } from "#src/services/message/emoji/constants";
import { getPickableEmojiContent } from "#src/services/message/emoji/getPickableEmojiContent";
import { getPickableEmojiTag } from "#src/services/message/emoji/getPickableEmojiTag";
import { searchEmojis } from "#src/services/message/emoji/searchEmojis";
import { getRender } from "#src/services/message/getRender";
import { useEmojiPickerStore } from "#src/store/message/emojiPicker";
import { useRoomEmojiStore } from "#src/store/message/room/emoji";
import { PluginKey } from "@tiptap/pm/state";

export const EmojiSuggestion: Except<SuggestionOptions<PickableEmoji, PickableEmoji>, "editor"> = {
  char: SuggestionTrigger.Emoji,
  command: ({ editor, props: emoji, range }) => {
    const emojiPickerStore = useEmojiPickerStore();
    const { skinTone } = emojiPickerStore;
    const content = getPickableEmojiContent(emoji, getPickableEmojiTag(emoji, skinTone));
    editor.chain().focus().deleteRange(range).insertContent(content).run();
  },
  // The same index and the same ranking the picker searches, so the two surfaces cannot disagree on what a
  // Query means — the shortcode is boosted hardest and an exact one is pinned, which is what a `:` query wants
  items: ({ query }) => {
    if (query.length < EMOJI_SUGGESTION_MIN_QUERY_LENGTH) return [];

    const roomEmojiStore = useRoomEmojiStore();
    const { customEmojis } = roomEmojiStore;
    return searchEmojis(query, customEmojis).slice(0, MAX_EMOJI_SUGGESTIONS);
  },
  pluginKey: new PluginKey("emojiSuggestion"),
  render: getRender(EmojiSuggestionList),
};
