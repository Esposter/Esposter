import type { EmojiItem } from "@/models/message/EmojiItem";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import EmojiSuggestionList from "@/components/Message/Model/Message/Suggestion/EmojiList.vue";
import { MAX_EMOJI_SUGGESTIONS } from "@/services/message/emoji/constants";
import { searchEmojis } from "@/services/message/emoji/searchEmojis";
import { getRender } from "@/services/message/getRender";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { PluginKey } from "@tiptap/pm/state";

const EMOJI_SUGGESTION_MIN_QUERY_LENGTH = 2;

export const EmojiSuggestion: Except<SuggestionOptions<EmojiItem, EmojiItem>, "editor"> = {
  char: SuggestionTrigger.Emoji,
  command: ({ editor, props: emojiItem, range }) => {
    editor.chain().focus().deleteRange(range).insertContent(emojiItem.emoji).run();
  },
  // The same index and the same ranking the picker searches, so the two surfaces cannot disagree on what a
  // Query means — the shortcode is boosted hardest and an exact one is pinned, which is what a `:` query wants
  items: ({ query }) => {
    if (query.length < EMOJI_SUGGESTION_MIN_QUERY_LENGTH) return [];
    return searchEmojis(query)
      .slice(0, MAX_EMOJI_SUGGESTIONS)
      .map(({ character, slug }) => ({ emoji: character, name: slug }));
  },
  pluginKey: new PluginKey("emojiSuggestion"),
  render: getRender(EmojiSuggestionList),
};
