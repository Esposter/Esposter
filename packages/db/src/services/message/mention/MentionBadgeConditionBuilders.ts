import type { MentionConditionBuilder } from "@/models/message/MentionConditionBuilder";
import type { ClassifiedMentions } from "@esposter/shared";

import { getBroadcastMentionConditions } from "@/services/message/mention/getBroadcastMentionConditions";
import { getRoleMentionBadgeCondition } from "@/services/message/mention/getRoleMentionBadgeCondition";
import { getUserMentionBadgeCondition } from "@/services/message/mention/getUserMentionBadgeCondition";

// Mention badge targeting: direct and role mentions badge unconditionally; @everyone/@here follow
// The members' notification rules (Never opts out, @here requires online), same as push targeting.
export const MentionBadgeConditionBuilders = {
  broadcastIds: getBroadcastMentionConditions,
  regularUserIds: getUserMentionBadgeCondition,
  roleIds: getRoleMentionBadgeCondition,
} as const satisfies Record<keyof ClassifiedMentions, MentionConditionBuilder>;
