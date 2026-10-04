import type { TRPCRouter } from "#server/trpc/routers";
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { todoListRouter } from "#server/trpc/routers/todoList";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { ResourceType } from "@esposter/db-schema";
import { jsonDateParse, NotFoundError } from "@esposter/shared";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("todoListRouter", () => {
  const { getCaller } = setupResourceSuite(todoListRouter);
  let caller: DecorateRouterRecord<TRPCRouter["todoList"]>;
  const name = "name";
  const repository = "a/a";
  const otherRepository = "a/b";
  const timeZone = "UTC";

  beforeAll(() => {
    caller = getCaller();
  });

  // A follow-up's timestamps are the server's clock, pinned so each is the epoch
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.TodoList);

    const todoListResource: TodoListResource = {
      items: [new TodoListItem({ name, steps: [{ completedAt: new Date(0), id: crypto.randomUUID(), name }] })],
    };
    await caller.saveResourceContent({
      content: todoListResource,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(todoListResource)));
  });

  test("adds a follow-up at the foot with its notes escaped, and reads it back for its repository alone", async () => {
    expect.hasAssertions();

    const { contentVersion, id } = await caller.createResource({ name });
    const sessionId = crypto.randomUUID();
    const ownerItem = new TodoListItem({ name });
    await caller.saveResourceContent({ content: { items: [ownerItem] }, contentVersion, id });

    const itemId = await caller.addFollowUp({ id, name, notes: "<", repository, sessionId });
    const content = await caller.readResourceContent({ id });

    expect(content?.items.map(({ id: contentItemId }) => contentItemId)).toStrictEqual([ownerItem.id, itemId]);
    await expect(caller.readFollowUps({ id, repository })).resolves.toStrictEqual([
      {
        createdAt: new Date(0),
        id: itemId,
        name,
        notes: "<p>&lt;</p>",
        origin: { repository, sessionId },
        updatedAt: new Date(0),
      },
    ]);
    await expect(caller.readFollowUps({ id, repository: otherRepository })).resolves.toStrictEqual([]);
  });

  test("completes a follow-up with its summary, and refuses a todo the owner wrote", async () => {
    expect.hasAssertions();

    const { contentVersion, id } = await caller.createResource({ name });
    const sessionId = crypto.randomUUID();
    const ownerItem = new TodoListItem({ name });
    await caller.saveResourceContent({ content: { items: [ownerItem] }, contentVersion, id });
    const itemId = await caller.addFollowUp({ id, name, notes: "", repository, sessionId });

    await caller.completeFollowUp({ id, itemId, summary: " ", timeZone });
    const content = await caller.readResourceContent({ id });

    expect(content?.items[1]).toStrictEqual({
      completedAt: new Date(0),
      createdAt: new Date(0),
      id: itemId,
      name,
      notes: "<p> </p>",
      origin: { repository, sessionId },
      updatedAt: new Date(0),
    });
    await expect(caller.readFollowUps({ id, repository })).resolves.toStrictEqual([]);
    await expect(
      caller.completeFollowUp({ id, itemId: ownerItem.id, summary: " ", timeZone }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${new NotFoundError("FollowUp", ownerItem.id).message}]`);
  });

  test("hands a follow-up back, out of the drain's reach", async () => {
    expect.hasAssertions();

    const { id } = await caller.createResource({ name });
    const sessionId = crypto.randomUUID();
    const itemId = await caller.addFollowUp({ id, name, notes: "", repository, sessionId });

    await caller.handBackFollowUp({ id, itemId, reason: " " });
    const content = await caller.readResourceContent({ id });

    expect(content?.items[0]?.origin).toStrictEqual({ handedBackAt: new Date(0), repository, sessionId });
    await expect(caller.readFollowUps({ id, repository })).resolves.toStrictEqual([]);
    await expect(caller.handBackFollowUp({ id, itemId, reason: " " })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError("FollowUp", itemId).message}]`,
    );
  });
});
