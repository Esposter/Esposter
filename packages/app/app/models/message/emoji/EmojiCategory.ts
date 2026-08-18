import type { Emoji } from "@/models/message/emoji/Emoji";

// The rail renders this rather than the group enum, so a category can come from somewhere other than the
// Dataset — Frequently Used is built from the store, and custom emoji will append the same way
export interface EmojiCategory {
  emojis: Emoji[];
  icon: string;
  title: string;
}
