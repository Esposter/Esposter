import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";

import { MentionType } from "#src/models/message/MentionType";
import {
  MENTION_EVERYONE_ID,
  MENTION_HERE_ID,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
} from "#src/services/message/constants";
import { getMentions } from "#src/services/message/getMentions";

const BROADCAST_MENTION_IDS = new Set([MENTION_EVERYONE_ID, MENTION_HERE_ID]);

export const classifyMentions = (message: string): ClassifiedMentions => {
  const mentions = getMentions(message)
    .map((mention) => ({
      id: mention.getAttribute(MENTION_ID_ATTRIBUTE),
      type: mention.getAttribute(MENTION_ITEM_TYPE_ATTRIBUTE),
    }))
    // eslint-disable-next-line no-restricted-syntax -- an optional key is not assignable to the mapped element's required one, so the predicate overload drops out
    .filter((mention): mention is { id: string; type: string | undefined } => Boolean(mention.id));
  return {
    broadcastIds: mentions.filter(({ id }) => BROADCAST_MENTION_IDS.has(id)).map(({ id }) => id),
    regularUserIds: mentions
      .filter(({ id, type }) => !BROADCAST_MENTION_IDS.has(id) && type !== MentionType.Role)
      .map(({ id }) => id),
    roleIds: mentions.filter(({ type }) => type === MentionType.Role).map(({ id }) => id),
  };
};
