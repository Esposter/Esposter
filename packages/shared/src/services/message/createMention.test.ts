import type { MentionType } from "@/models/message/MentionType";

import {
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
} from "@/services/message/constants";
import { describe } from "vitest";

// The mention span exactly as the editor writes it, so every suite reading one asserts against the same shape
export const createMention = (id: string, itemType?: MentionType): string =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${id}"${itemType ? ` ${MENTION_ITEM_TYPE_ATTRIBUTE}="${itemType}"` : ""}></span>`;

describe.todo("createMention");
