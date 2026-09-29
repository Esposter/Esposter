import { followUpListInputSchema } from "#shared/models/db/resource/todoList/FollowUpListInput";
import { aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { todoListItemOriginSchema } from "#shared/models/resource/todoList/TodoListItemOrigin";
import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { z } from "zod";

export const addFollowUpInputSchema = z.object({
  ...followUpListInputSchema.shape,
  dueAt: z.iso
    .datetime({ offset: true })
    .optional()
    .meta({ description: "Only for a real deadline: a due date sends the owner a reminder" }),
  name: aNamedItemEntitySchema.shape.name.meta({ description: "An instruction a cold session can act on" }),
  notes: z
    .string()
    .max(TODO_LIST_ITEM_NOTES_MAX_LENGTH)
    .meta({ description: "Plain text: the files involved and what done looks like" }),
  repository: todoListItemOriginSchema.shape.repository.meta({
    description: "This repository as owner/name, as this session's context gives it",
  }),
  sessionId: todoListItemOriginSchema.shape.sessionId.meta({
    description: "This Claude Code session's id, as this session's context gives it",
  }),
});
export type AddFollowUpInput = z.infer<typeof addFollowUpInputSchema>;
