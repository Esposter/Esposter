import type { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";

import { recurrenceUnitSchema } from "#shared/models/resource/todoList/RecurrenceUnit";
import { TODO_LIST_RECURRENCE_INTERVAL_MAX } from "#shared/services/resource/item/constants";
import { z } from "zod";

// How a todo repeats: every interval of a unit, counted from the due date the repeat was set on, so a monthly todo due
// On the 31st returns to the 31st after a shorter month rather than staying on the day it was clamped to
export interface Recurrence {
  interval: number;
  startsAt: Date;
  unit: RecurrenceUnit;
}

export const recurrenceSchema = z.object({
  interval: z.int().min(1).max(TODO_LIST_RECURRENCE_INTERVAL_MAX),
  startsAt: z.coerce.date(),
  unit: recurrenceUnitSchema,
}) satisfies z.ZodType<Recurrence>;
