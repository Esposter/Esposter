import { followUpInputSchema } from "#shared/models/db/resource/todoList/FollowUpInput";
import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { z } from "zod";

export const handBackFollowUpInputSchema = z.object({
  ...followUpInputSchema.shape,
  reason: z
    .string()
    .min(1)
    .max(TODO_LIST_ITEM_NOTES_MAX_LENGTH)
    .meta({ description: "What the owner has to decide or do before an agent can take it" }),
});
export type HandBackFollowUpInput = z.infer<typeof handBackFollowUpInputSchema>;
