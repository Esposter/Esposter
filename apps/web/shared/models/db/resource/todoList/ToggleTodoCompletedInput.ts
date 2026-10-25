import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { timeZoneSchema } from "#shared/models/entity/TimeZone";
import { z } from "zod";

export const toggleTodoCompletedInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  itemId: aItemEntitySchema.shape.id.meta({ description: "The todo's id, as readResourceContent gave it" }),
  timeZone: timeZoneSchema.shape.timeZone.meta({
    description: "This session's IANA time zone, as its context gives it, which a repeating todo rolls in",
  }),
});
export type ToggleTodoCompletedInput = z.infer<typeof toggleTodoCompletedInputSchema>;
