import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";

import { CUSTOM_EMOJI_TAG_PREFIX } from "@esposter/db-schema";

export const getCustomEmojiTag = (id: CustomEmoji["id"]) => `${CUSTOM_EMOJI_TAG_PREFIX}${id}`;
