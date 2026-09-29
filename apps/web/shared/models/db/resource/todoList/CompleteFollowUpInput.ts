import { followUpInputSchema } from "#shared/models/db/resource/todoList/FollowUpInput";
import { TIME_ZONE_MAX_LENGTH } from "#shared/services/intl/constants";
import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { getResult } from "@esposter/shared";
import { z } from "zod";

export const completeFollowUpInputSchema = z.object({
  ...followUpInputSchema.shape,
  summary: z
    .string()
    .min(1)
    .max(TODO_LIST_ITEM_NOTES_MAX_LENGTH)
    .meta({ description: "One line on what was done, naming the commit" }),
  // Resolved as `getNextDueAt` will resolve it, so any id it accepts passes and none it rejects does
  timeZone: z
    .string()
    .max(TIME_ZONE_MAX_LENGTH)
    .refine(
      (timeZone) =>
        getResult(() => Temporal.Now.plainDateISO(timeZone)).match(
          () => true,
          () => false,
        ),
      { error: "Expected an IANA time zone" },
    )
    .meta({
      description: "This session's IANA time zone, as its context gives it, which a repeating follow-up rolls in",
    }),
});
export type CompleteFollowUpInput = z.infer<typeof completeFollowUpInputSchema>;
