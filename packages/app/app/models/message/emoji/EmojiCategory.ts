import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";

// The rail renders this rather than the group enum, so a category can come from somewhere other than the
// Dataset — Frequently Used and the room's own uploaded emoji are both built from a store
export interface EmojiCategory {
  emojis: PickableEmoji[];
  icon: string;
  title: string;
}
