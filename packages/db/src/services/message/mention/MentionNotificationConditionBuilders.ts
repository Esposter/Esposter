import type { MentionConditionBuilder } from "@/models/message/MentionConditionBuilder";
import type { ClassifiedMentions } from "@esposter/shared";

import { createMentionConditionBuilders } from "@/services/message/mention/createMentionConditionBuilders";
import { getDirectMessageNotificationCondition } from "@/services/message/mention/getDirectMessageNotificationCondition";

export const MentionNotificationConditionBuilders: Record<keyof ClassifiedMentions, MentionConditionBuilder> =
  createMentionConditionBuilders(getDirectMessageNotificationCondition);
