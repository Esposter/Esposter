import type { EmojiGroup } from "@/models/message/emoji/EmojiGroup";

// The one record every emoji surface renders from — the picker grid, the composer's `:` suggestions and a
// Stored reaction all resolve to this. Keywords are not on it: they exist only to be indexed for search
export interface Emoji {
  character: string;
  group: EmojiGroup;
  isSkinToneSupported: boolean;
  name: string;
  slug: string;
}
