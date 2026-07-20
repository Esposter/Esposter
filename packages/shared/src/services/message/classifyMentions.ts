import type { ClassifiedMentions } from "@/models/message/ClassifiedMentions";

import { MentionType } from "@/models/message/MentionType";
import {
  MENTION_EVERYONE_ID,
  MENTION_HERE_ID,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
} from "@/services/message/constants";
import { getMentions } from "@/services/message/getMentions";

const BROADCAST_MENTION_IDS = new Set([MENTION_EVERYONE_ID, MENTION_HERE_ID]);

export const classifyMentions = (message: string): ClassifiedMentions => {
  const mentions = getMentions(message)
    .map((m) => ({ id: m.getAttribute(MENTION_ID_ATTRIBUTE), type: m.getAttribute(MENTION_ITEM_TYPE_ATTRIBUTE) }))
    // eslint-disable-next-line no-restricted-syntax -- an optional key is not assignable to the mapped element's required one, so the predicate overload drops out
    .filter((m): m is { id: string; type: string | undefined } => Boolean(m.id));
  return {
    broadcastIds: mentions.filter(({ id }) => BROADCAST_MENTION_IDS.has(id)).map(({ id }) => id),
    regularUserIds: mentions
      .filter(({ id, type }) => !BROADCAST_MENTION_IDS.has(id) && type !== MentionType.Role)
      .map(({ id }) => id),
    roleIds: mentions.filter(({ type }) => type === MentionType.Role).map(({ id }) => id),
  };
};
