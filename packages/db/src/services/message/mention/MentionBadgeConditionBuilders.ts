import type { MentionConditionBuilder } from "@/models/message/MentionConditionBuilder";
import type { ClassifiedMentions } from "@esposter/shared";

import { createMentionConditionBuilders } from "@/services/message/mention/createMentionConditionBuilders";
import { getMentionedUserIdCondition } from "@/services/message/mention/getMentionedUserIdCondition";

// Mention badge targeting: direct and role mentions badge unconditionally; @everyone/@here follow
// The members' notification rules (Never opts out, @here requires online), same as push targeting.
export const MentionBadgeConditionBuilders: Record<keyof ClassifiedMentions, MentionConditionBuilder> =
  createMentionConditionBuilders(getMentionedUserIdCondition);
