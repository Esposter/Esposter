import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { FollowUp } from "@@/server/models/resource/todoList/FollowUp";
import type { ToData } from "@esposter/shared";

// Written by a session, not yet done and not handed back: the only todos an agent reads or acts on. A todo the owner
// Wrote is out of an agent's reach, whatever id it is sent
export const checkIsOpenFollowUp = (item: ToData<TodoListItem>): item is FollowUp =>
  Boolean(item.origin && !item.origin.handedBackAt && !item.completedAt);
