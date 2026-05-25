import type { MentionConditionBuilder } from "@/models/message/MentionConditionBuilder";
import type { ClassifiedMentions } from "@esposter/shared";

import { getBroadcastMentionConditions } from "@/services/message/mention/getBroadcastMentionConditions";
import { getRoleMentionCondition } from "@/services/message/mention/getRoleMentionCondition";
import { getUserMentionCondition } from "@/services/message/mention/getUserMentionCondition";

export const MentionNotificationConditionBuilders = {
  broadcastIds: getBroadcastMentionConditions,
  regularUserIds: getUserMentionCondition,
  roleIds: getRoleMentionCondition,
} as const satisfies Record<keyof ClassifiedMentions, MentionConditionBuilder>;
