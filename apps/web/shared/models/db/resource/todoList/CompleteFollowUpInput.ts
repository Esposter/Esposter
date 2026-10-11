import { followUpInputSchema } from "#shared/models/db/resource/todoList/FollowUpInput";
import { timeZoneSchema } from "#shared/models/entity/TimeZone";
import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { z } from "zod";

export const completeFollowUpInputSchema = z.object({
  ...followUpInputSchema.shape,
  summary: z
    .string()
    .min(1)
    .max(TODO_LIST_ITEM_NOTES_MAX_LENGTH)
    .meta({ description: "One line on what was done, naming the commit" }),
  timeZone: timeZoneSchema.shape.timeZone.meta({
    description: "This session's IANA time zone, as its context gives it, which a repeating follow-up rolls in",
  }),
});
export type CompleteFollowUpInput = z.infer<typeof completeFollowUpInputSchema>;
