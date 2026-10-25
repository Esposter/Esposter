import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";

import { MAX_EMOJI_SEARCH_RESULTS } from "@/services/message/emoji/constants";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";
import { getMiniSearch } from "@/services/message/emoji/getMiniSearch";

// `fuzzy` is off: on names this short it manufactures noise rather than forgiving typos. Punctuation is a
// Delimiter and never an operator, so "grin(" searches for "grin" and a query that is punctuation alone
// Tokenizes to nothing and returns the empty state rather than failing to compile
export const searchEmojis = (query: string, customEmojis: CustomEmoji[] = []): PickableEmoji[] => {
  const { slugEmojiMap } = getEmojiIndex();
  // The room's set is smaller than the result cap by construction, so it is matched directly rather than merged
  // Into the global index — which stays room-independent and built once — and its hits lead, the ranking Discord
  // Gives a server's own emoji
  const normalizedQuery = query.toLowerCase();
  const customMatches = customEmojis.filter(({ name }) => name.includes(normalizedQuery));
  // BM25 has no reason to rank an exact shortcode above a longer one that also matched, so it is pinned
  const exactMatch = slugEmojiMap.get(normalizedQuery);
  const results = getMiniSearch()
    .search(query)
    .flatMap(({ id }) => {
      const emoji = slugEmojiMap.get(String(id));
      return emoji && emoji !== exactMatch ? [emoji] : [];
    });
  const unicodeResults = exactMatch ? [exactMatch, ...results] : results;
  return [...customMatches, ...unicodeResults].slice(0, MAX_EMOJI_SEARCH_RESULTS);
};
