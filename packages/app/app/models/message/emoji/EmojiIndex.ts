import type { Emoji } from "@/models/message/emoji/Emoji";
import type { EmojiGroup } from "@/models/message/emoji/EmojiGroup";

// Three views over the same records, each answering one question in constant time: what a stored reaction
// Renders as, what a picked character is stored as, and what a category tab shows
export interface EmojiIndex {
  // Keyed by `getEmojiCharacterKey`, so a toned variant and a legacy unqualified glyph both find their base
  characterEmojiMap: Map<string, Emoji>;
  groupEmojisMap: Map<EmojiGroup, Emoji[]>;
  slugEmojiMap: Map<string, Emoji>;
}
