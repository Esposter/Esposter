import { followUpListInputSchema } from "#shared/models/db/resource/todoList/FollowUpListInput";
import { todoListItemOriginSchema } from "#shared/models/resource/todoList/TodoListItemOrigin";
import { z } from "zod";

export const readFollowUpsInputSchema = z.object({
  ...followUpListInputSchema.shape,
  repository: todoListItemOriginSchema.shape.repository.meta({
    description: "This repository as owner/name, as this session's context gives it",
  }),
});
export type ReadFollowUpsInput = z.infer<typeof readFollowUpsInputSchema>;
