import type { EmojiIndex } from "@/models/message/emoji/EmojiIndex";

import { createEmojiIndex } from "@/services/message/emoji/createEmojiIndex";

let emojiIndex: EmojiIndex | undefined;
// Built on first use rather than at import, so nothing pays for it on a page with no emoji surface, and once
// Rather than per consumer — a reaction list, the picker and the composer all read the same three maps
export const getEmojiIndex = () => (emojiIndex ??= createEmojiIndex());
