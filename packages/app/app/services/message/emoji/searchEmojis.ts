import type { EmojiDocument } from "@/models/message/emoji/EmojiDocument";

import { EmojiDocumentPropertyNames } from "@/models/message/emoji/EmojiDocument";
import { MAX_EMOJI_SEARCH_RESULTS } from "@/services/message/emoji/constants";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";
import keywordsByCharacter from "emojilib";
import MiniSearch from "minisearch";

let miniSearch: MiniSearch<EmojiDocument> | undefined;

// Separate from `getEmojiIndex` so a surface that only renders a stored reaction never builds a search index
const getMiniSearch = () => (miniSearch ??= createMiniSearch());

const createMiniSearch = () => {
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
    [...getEmojiIndex().bySlug.values()].map(({ character, name, slug }) => ({
      keywords: (keywordsByCharacter[character] ?? []).join(" "),
      name,
      slug,
    })),
  );
  return index;
};

// `fuzzy` is off: on names this short it manufactures noise rather than forgiving typos. Punctuation is a
// Delimiter and never an operator, so "grin(" searches for "grin" and a query that is punctuation alone
// Tokenizes to nothing and returns nothing — the empty state, not the thrown regex `node-emoji` gave it
export const searchEmojis = (query: string) => {
  const { bySlug } = getEmojiIndex();
  // BM25 has no reason to rank an exact shortcode above a longer one that also matched, so it is pinned
  const exactMatch = bySlug.get(query.toLowerCase());
  const results = getMiniSearch()
    .search(query)
    .flatMap(({ id }) => {
      const emoji = bySlug.get(String(id));
      return emoji && emoji !== exactMatch ? [emoji] : [];
    });
  return (exactMatch ? [exactMatch, ...results] : results).slice(0, MAX_EMOJI_SEARCH_RESULTS);
};
