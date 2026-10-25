import type { EmojiDocument } from "@/models/message/emoji/EmojiDocument";

import { EmojiDocumentPropertyNames } from "@/models/message/emoji/EmojiDocument";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";
import characterKeywordsMap from "emojilib";
import MiniSearch from "minisearch";

export const createMiniSearch = () => {
  const index = new MiniSearch<EmojiDocument>({
    fields: [EmojiDocumentPropertyNames.slug, EmojiDocumentPropertyNames.name, EmojiDocumentPropertyNames.keywords],
    idField: EmojiDocumentPropertyNames.slug,
    searchOptions: {
      // The shortcode is what a `:` query is naming, and the name is closer to it than a keyword blob is
      boost: { [EmojiDocumentPropertyNames.name]: 2, [EmojiDocumentPropertyNames.slug]: 3 },
      // The default unions terms, which makes a two-word query return nearly the whole dataset
      combineWith: "AND",
      prefix: true,
    },
  });
  // `emojilib` is keyed by the same character `unicode-emoji-json` is, which is what makes the join a lookup
  index.addAll(
    Array.from(getEmojiIndex().slugEmojiMap.values(), ({ character, name, slug }) => ({
      keywords: (characterKeywordsMap[character] ?? []).join(" "),
      name,
      slug,
    })),
  );
  return index;
};
