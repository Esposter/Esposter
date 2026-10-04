import type { FollowUp } from "#server/models/resource/todoList/FollowUp";

import { readResourceContent } from "#server/services/resource/readResourceContent";
import { appendNotesParagraph } from "#server/services/resource/todoList/appendNotesParagraph";
import { checkIsOpenFollowUp } from "#server/services/resource/todoList/checkIsOpenFollowUp";
import { requireOpenFollowUp } from "#server/services/resource/todoList/requireOpenFollowUp";
import { updateTodoListContent } from "#server/services/resource/todoList/updateTodoListContent";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { addFollowUpInputSchema } from "#shared/models/db/resource/todoList/AddFollowUpInput";
import { completeFollowUpInputSchema } from "#shared/models/db/resource/todoList/CompleteFollowUpInput";
import { handBackFollowUpInputSchema } from "#shared/models/db/resource/todoList/HandBackFollowUpInput";
import { readFollowUpsInputSchema } from "#shared/models/db/resource/todoList/ReadFollowUpsInput";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { rollRecurringItem } from "#shared/services/resource/todoList/rollRecurringItem";
import { ResourceType } from "@esposter/db-schema";

// The follow-up procedures an agent reaches through the MCP endpoint (/docs/resource/todolist-agent-follow-ups). Each
// Reads, changes and saves the list on the server, and acts only on a follow-up — a todo with an origin, open and not
// Handed back — so no key ticks or annotates a todo the owner wrote, and none deletes one
export const todoListRouter = router({
  ...createResourceProcedures(ResourceType.TodoList),
  addFollowUp: getOwnerProcedure(ResourceType.TodoList, addFollowUpInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Write down one follow-up this session found and is leaving undone: work outside the change in hand that a later session can finish in one change. Write it the moment it is recognised. Answers with its id.",
      },
    })
    .mutation<string>(({ ctx, input: { dueAt, id, name, notes, repository, sessionId } }) =>
      updateTodoListContent(ctx, id, (todoList) => {
        const followUp = new TodoListItem({
          ...(dueAt ? { dueAt: new Date(dueAt) } : {}),
          name,
          origin: { repository, sessionId },
        });
        if (notes) appendNotesParagraph(followUp, notes);
        // At the foot of the list, as quick add puts a todo
        todoList.items.push(followUp);
        return followUp.id;
      }),
    ),
  completeFollowUp: getOwnerProcedure(ResourceType.TodoList, completeFollowUpInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Tick a follow-up once its change is committed, with a line on what was done that names the commit. A repeating follow-up rolls to its next due date instead.",
      },
    })
    .mutation<void>(async ({ ctx, input: { id, itemId, summary, timeZone } }) => {
      await updateTodoListContent(ctx, id, (todoList) => {
        const followUp = requireOpenFollowUp(todoList, itemId);
        appendNotesParagraph(followUp, summary);
        // As the checkbox ticks it
        if (followUp.recurrence && followUp.dueAt)
          rollRecurringItem(followUp, followUp.dueAt, followUp.recurrence, timeZone);
        else followUp.completedAt = new Date();
      });
    }),
  handBackFollowUp: getOwnerProcedure(ResourceType.TodoList, handBackFollowUpInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Hand a follow-up to the owner when doing it needs a design decision, anything spent outside the repository's review queue, or more than one change. It leaves readFollowUps until the owner clears the handback.",
      },
    })
    .mutation<void>(async ({ ctx, input: { id, itemId, reason } }) => {
      await updateTodoListContent(ctx, id, (todoList) => {
        const followUp = requireOpenFollowUp(todoList, itemId);
        followUp.origin.handedBackAt = new Date();
        appendNotesParagraph(followUp, reason);
      });
    }),
  readFollowUps: getOwnerProcedure(ResourceType.TodoList, readFollowUpsInputSchema, "id")
    .meta({
      mcp: {
        description:
          "The open follow-ups of this repository, in the order the owner put them, first to be taken first. Read again after every follow-up, since the owner edits the list while a drain runs.",
      },
    })
    .query<FollowUp[]>(async ({ ctx, input: { repository } }) => {
      const todoList = await readResourceContent(
        ResourceDefinitionMap[ResourceType.TodoList].contentSchema,
        ctx.resource.id,
      );
      const now = new Date();
      // A repeating follow-up rolls on when it is ticked and stays open, so it waits for its next due date rather than
      // Being taken again straight away
      return (todoList?.items ?? []).filter(
        (item): item is FollowUp =>
          checkIsOpenFollowUp(item) &&
          item.origin.repository === repository &&
          !(item.recurrence && item.dueAt && item.dueAt > now),
      );
    }),
});
