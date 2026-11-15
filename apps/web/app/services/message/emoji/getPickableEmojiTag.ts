import type { PickableEmoji } from "#src/models/message/emoji/PickableEmoji";
import type { SkinTone } from "#src/models/message/emoji/SkinTone";

import { EmojiType } from "#src/models/message/emoji/EmojiType";
import { applySkinTone } from "#src/services/message/emoji/applySkinTone";
import { getCustomEmojiTag } from "#src/services/message/emoji/getCustomEmojiTag";

// The one place a picked emoji becomes the string a reaction stores, so a chip and a quick-reaction bar cannot
// Disagree about what was picked: a toned character for the dataset, an id-keyed tag for a room's upload
export const getPickableEmojiTag = (emoji: PickableEmoji, skinTone: SkinTone) =>
  emoji.type === EmojiType.Custom ? getCustomEmojiTag(emoji.id) : applySkinTone(emoji, skinTone);
