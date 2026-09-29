import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { z } from "zod";

// The TodoList a follow-up tool reads or writes, which the owner guard checks as it does every TodoList procedure's
export const followUpListInputSchema = z.object({
  id: resourceIdInputSchema.shape.id.meta({
    description: "The follow-up list's id, as this session's context gives it",
  }),
});
export type FollowUpListInput = z.infer<typeof followUpListInputSchema>;
