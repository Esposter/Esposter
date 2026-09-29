import { followUpListInputSchema } from "#shared/models/db/resource/todoList/FollowUpListInput";
import { aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { z } from "zod";

// One follow-up in the list, by the id `readFollowUps` gave it
export const followUpInputSchema = z.object({
  ...followUpListInputSchema.shape,
  itemId: aItemEntitySchema.shape.id.meta({ description: "The follow-up's id, as readFollowUps gave it" }),
});
export type FollowUpInput = z.infer<typeof followUpInputSchema>;
