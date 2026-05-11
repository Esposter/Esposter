import type { EmojiItem } from "@/models/message/EmojiItem";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Except } from "type-fest";

import EmojiSuggestionList from "@/components/Message/Model/Message/Suggestion/EmojiList.vue";
import { getRender } from "@/services/message/getRender";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { PluginKey } from "@tiptap/pm/state";
import { search } from "node-emoji";

const EMOJI_SUGGESTION_MIN_QUERY_LENGTH = 2;
const MAX_EMOJI_SUGGESTIONS = 20;

export const EmojiSuggestion: Except<SuggestionOptions<EmojiItem, EmojiItem>, "editor"> = {
  char: SuggestionTrigger.Emoji,
  command: ({ editor, props: emojiItem, range }) => {
    editor.chain().focus().deleteRange(range).insertContent(emojiItem.emoji).run();
  },
  items: ({ query }) => {
    if (query.length < EMOJI_SUGGESTION_MIN_QUERY_LENGTH) return [];
    return search(query).slice(0, MAX_EMOJI_SUGGESTIONS);
  },
  pluginKey: new PluginKey("emojiSuggestion"),
  render: getRender(EmojiSuggestionList),
};
