import type { MentionType } from "@esposter/shared";

import {
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
} from "@esposter/shared";
import { describe } from "vitest";

// The mention span as the editor writes it — every suite that drives mention fan-out asserts against one shape
export const createMention = (id: string, itemType?: MentionType): string =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${id}"${itemType ? ` ${MENTION_ITEM_TYPE_ATTRIBUTE}="${itemType}"` : ""}></span>`;

describe.todo("createMention");
