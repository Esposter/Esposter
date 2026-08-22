import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";
import type { SkinTone } from "@/models/message/emoji/SkinTone";

import { EmojiType } from "@/models/message/emoji/EmojiType";
import { applySkinTone } from "@/services/message/emoji/applySkinTone";
import { getCustomEmojiTag } from "@/services/message/emoji/getCustomEmojiTag";

// The one place a picked emoji becomes the string a reaction stores, so a chip and a quick-reaction bar cannot
// Disagree about what was picked: a toned character for the dataset, an id-keyed tag for a room's upload
export const getPickableEmojiTag = (emoji: PickableEmoji, skinTone: SkinTone) =>
  emoji.type === EmojiType.Custom ? getCustomEmojiTag(emoji.id) : applySkinTone(emoji, skinTone);
