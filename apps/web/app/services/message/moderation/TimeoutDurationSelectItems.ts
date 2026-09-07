import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";

// The one list of durations every timeout picker offers, built once rather than per component instance
export const TimeoutDurationSelectItems: SelectItemCategoryDefinition<number>[] = Object.entries(
  TimeoutDurationMap,
).map(([title, value]) => ({ title, value }));
