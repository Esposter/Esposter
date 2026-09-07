import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";

import { CUSTOM_EMOJI_TAG_PREFIX } from "#shared/services/message/emoji/constants";

export const getCustomEmojiTag = (id: CustomEmoji["id"]) => `${CUSTOM_EMOJI_TAG_PREFIX}${id}`;
