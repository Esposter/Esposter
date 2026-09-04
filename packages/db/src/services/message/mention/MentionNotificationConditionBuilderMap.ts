import type { MentionConditionBuilder } from "#src/models/message/MentionConditionBuilder";
import type { ClassifiedMentions } from "@esposter/shared";

import { createMentionConditionBuilders } from "#src/services/message/mention/createMentionConditionBuilders";
import { getDirectMessageNotificationCondition } from "#src/services/message/mention/getDirectMessageNotificationCondition";

export const MentionNotificationConditionBuilderMap: Record<keyof ClassifiedMentions, MentionConditionBuilder> =
  createMentionConditionBuilders(getDirectMessageNotificationCondition);
