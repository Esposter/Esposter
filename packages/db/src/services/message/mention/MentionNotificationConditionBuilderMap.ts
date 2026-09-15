import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";
import type { MentionConditionBuilder } from "#src/models/message/mention/MentionConditionBuilder";

import { createMentionConditionBuilders } from "#src/services/message/mention/createMentionConditionBuilders";
import { getDirectMessageNotificationCondition } from "#src/services/message/mention/getDirectMessageNotificationCondition";

export const MentionNotificationConditionBuilderMap: Record<keyof ClassifiedMentions, MentionConditionBuilder> =
  createMentionConditionBuilders(getDirectMessageNotificationCondition);
