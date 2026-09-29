import {
  TODO_LIST_ITEM_REPOSITORY_MAX_LENGTH,
  TODO_LIST_ITEM_REPOSITORY_REGEX,
} from "#shared/services/resource/item/constants";
import { z } from "zod";

// Where a follow-up came from: the repository it belongs to and the Claude Code session that wrote it, for
// `claude --resume`. A todo the owner wrote has none
export interface TodoListItemOrigin {
  // Set once a drain hands it to the owner, and absent while an agent may still take it
  handedBackAt?: Date;
  repository: string;
  sessionId: string;
}

export const todoListItemOriginSchema = z.object({
  handedBackAt: z.coerce.date().optional(),
  repository: z.string().max(TODO_LIST_ITEM_REPOSITORY_MAX_LENGTH).regex(TODO_LIST_ITEM_REPOSITORY_REGEX),
  sessionId: z.uuid(),
}) satisfies z.ZodType<TodoListItemOrigin>;
