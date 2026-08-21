import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { Content } from "@tiptap/vue-3";

import { EmojiType } from "@/models/message/emoji/EmojiType";
import { CUSTOM_EMOJI_TYPE } from "@esposter/shared";

// What the composer inserts for a pick: a character carries itself into the document, while a room's upload
// Becomes the node that resolves to its image on render. Both come off one pick, so the picker never learns
// Which surface it is feeding — it hands over the reaction tag, and this decides what content that means
export const getPickableEmojiContent = (emoji: PickableEmoji, emojiTag: string): Content =>
  emoji.type === EmojiType.Custom ? { attrs: { id: emoji.id, name: emoji.name }, type: CUSTOM_EMOJI_TYPE } : emojiTag;
