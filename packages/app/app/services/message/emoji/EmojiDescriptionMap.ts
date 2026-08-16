import { EmojiMenuItems } from "@/services/message/emoji/EmojiMenuItems";
import { EmojiMoreMenuItems } from "@/services/message/emoji/EmojiMoreMenuItems";
import { unemojify } from "@/services/message/emoji/unemojify";

// Both menus are fixed lists, so their tooltip text is resolved once at module load rather than by a
// Reverse emoji lookup per item on every render of a hover menu
export const EmojiDescriptionMap = new Map(
  [...EmojiMenuItems, ...EmojiMoreMenuItems].map((emoji) => [emoji, unemojify(emoji)]),
);
