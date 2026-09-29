import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { FollowUp } from "@@/server/models/resource/todoList/FollowUp";
import type { ToData } from "@esposter/shared";

import { checkIsOpenFollowUp } from "@@/server/services/resource/todoList/checkIsOpenFollowUp";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";

// The open follow-up an agent names, as it stands in the list, so a change to it is a change to the list. A todo the
// Owner wrote answers as missing, so no key can tick or annotate one
export const requireOpenFollowUp = (todoList: ToData<TodoListResource>, itemId: TodoListItem["id"]): FollowUp => {
  const followUp = todoList.items.find(({ id }) => id === itemId);
  if (!followUp || !checkIsOpenFollowUp(followUp)) throw getNotFoundError("FollowUp", itemId);
  return followUp;
};
