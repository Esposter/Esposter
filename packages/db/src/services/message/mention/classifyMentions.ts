import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";

import {
  getMentions,
  MENTION_EVERYONE_ID,
  MENTION_HERE_ID,
  MENTION_ID_ATTRIBUTE,
  MENTION_ITEM_TYPE_ATTRIBUTE,
  MentionType,
} from "@esposter/shared";

const BROADCAST_MENTION_IDS = new Set([MENTION_EVERYONE_ID, MENTION_HERE_ID]);

export const classifyMentions = (message: string): ClassifiedMentions => {
  const mentions = getMentions(message).flatMap((mention) => {
    const id = mention.getAttribute(MENTION_ID_ATTRIBUTE);
    const type = mention.getAttribute(MENTION_ITEM_TYPE_ATTRIBUTE);
    return id ? [{ id, type }] : [];
  });
  return {
    broadcastIds: mentions.filter(({ id }) => BROADCAST_MENTION_IDS.has(id)).map(({ id }) => id),
    regularUserIds: mentions
      .filter(({ id, type }) => !BROADCAST_MENTION_IDS.has(id) && type !== MentionType.Role)
      .map(({ id }) => id),
    roleIds: mentions.filter(({ type }) => type === MentionType.Role).map(({ id }) => id),
  };
};
