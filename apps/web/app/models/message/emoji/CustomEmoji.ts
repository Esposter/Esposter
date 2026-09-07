import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { EmojiType } from "@/models/message/emoji/EmojiType";

// A room's uploaded emoji as every picking surface sees it. It carries the same `name`/`slug` pair a dataset
// Entry does — the name is already slug-shaped, so search, `:` completion and the recents list need no second
// Code path — and the image url in place of a character
export interface CustomEmoji extends Pick<RoomEmojiWithSasUrl, "id" | "name" | "sasUrl"> {
  slug: string;
  type: EmojiType.Custom;
}
