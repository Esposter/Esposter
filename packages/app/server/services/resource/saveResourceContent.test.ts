import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { AzureQueue, AzureTable, ResourceActivityType, resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockServiceBusDatabase, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The upload is the seam a post-blob failure has to be injected at: it is the only step between the version bump
// And the commit that is not transactional, so rejecting anything earlier proves nothing about the window where
// The row and the blob can disagree. It delegates to the real upload by default, so every other test is unaffected
const { uploadMock } = vi.hoisted(() => ({
  uploadMock: vi.fn<typeof import("@@/server/composables/azure/container/useUpload").useUpload>(),
}));

vi.mock(import("@@/server/composables/azure/container/useUpload"), async (importOriginal) => {
  const { useUpload } = await importOriginal();
  uploadMock.mockImplementation(useUpload);
  return { useUpload: uploadMock };
});

// The one place a resource's content blob is written, so its whole tail — the save event, the activity entry
// And the type's registered after-save hook — is asserted here once. Every path that writes content (the
// Editor's save, blueprint deploy, duplicate, restore) keeps only a wiring test proving it comes through here.
// TodoList is the representative type: it is the one with a registered after-save hook
const readActivityTypes = () =>
  [...(MockTableDatabase.get(AzureTable.ResourceActivity)?.values() ?? [])].map(
    ({ activityType }) => activityType as ResourceActivityType,
  );

// The real compare-and-set the editor's save runs, so the losing case fails the way production fails
const updateContentVersion = async (tx: Transaction, id: Resource["id"]) =>
  takeOne(await tx.update(resources).set({ contentVersion: 1 }).where(eq(resources.id, id)).returning());

describe(saveResourceContent, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: Resource;
  const name = "name";
  const surveyId = crypto.randomUUID();
  const unboundProgramContent = { audience: null, emailId: "", keyColumn: "", surveyId: "" };
  // A Program already bound to a survey, which is the only state an unbind can be observed from
  const createBoundProgram = async () =>
    takeOne(
      await ctx.db
        .insert(resources)
        .values({ boundResourceId: surveyId, name, type: ResourceType.Program, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  const readBoundResourceId = async (id: Resource["id"]) =>
    (await ctx.db.query.resources.findFirst({ where: { id: { eq: id } } }))?.boundResourceId;
  // The clock is pinned at the epoch, so the smallest future instant is all a reminder needs to be scheduled
  const dueAt = new Date(1);
  const item = new TodoListItem({ dueAt, name });
  const content: TodoListResource = { items: [item] };
  const { contentSchema } = ResourceDefinitionMap[ResourceType.TodoList];
  const createReminder = (resourceId: Resource["id"]) => ({
    body: { dueAt, itemId: item.id, resourceId },
    scheduledEnqueueTimeUtc: dueAt,
  });

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0 });
    resource = takeOne(
      await mockContext.db
        .insert(resources)
        .values({ name, type: ResourceType.TodoList, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    resourceEventEmitter.removeAllListeners("saveResourceContent");
    MockContainerDatabase.clear();
    MockServiceBusDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("writes the content, emits the save, records the activity and runs the after-save hook as one unit", async () => {
    expect.hasAssertions();

    let saveEvent: undefined | { content: unknown; contentVersion: Resource["contentVersion"]; id: Resource["id"] };
    resourceEventEmitter.on("saveResourceContent", ([data]) => {
      saveEvent = data;
    });
    const savedResource = await saveResourceContent(ctx, {
      activityType: ResourceActivityType.ContentSaved,
      content,
      resource,
      updateContentVersion: async (tx) =>
        takeOne(
          await tx
            .update(resources)
            .set({ contentVersion: resource.contentVersion + 1 })
            .where(eq(resources.id, resource.id))
            .returning(),
        ),
    });
    // The hook and the activity entry are fire-and-forget off the write, so drain them before asserting
    await waitForSynchronizedFunctions();
    const storedContent = await readResourceContent(contentSchema, resource.id);
    assert.exists(saveEvent);

    expect(savedResource.contentVersion).toBe(resource.contentVersion + 1);
    expect(storedContent).toStrictEqual(jsonDateParse(JSON.stringify(content)));
    expect(saveEvent.id).toBe(resource.id);
    // The event carries the version the update returned, so a subscriber's next save is not rejected as stale
    expect(saveEvent.contentVersion).toBe(savedResource.contentVersion);
    // The event carries what was written, which is the parsed content — the same shape every reader gets back
    expect(saveEvent.content).toStrictEqual(jsonDateParse(JSON.stringify(content)));
    expect(readActivityTypes()).toStrictEqual([ResourceActivityType.ContentSaved]);
    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([createReminder(resource.id)]);
  });

  // The prior content is read before the write overwrites it, so a hook that diffs sees what it replaced —
  // Without it every write would look like a first write and re-fire everything the content declares
  test("runs the after-save hook against the content the write replaces", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();
    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();

    // The second write repeats an unchanged due date, so it schedules nothing on top of the first
    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([createReminder(resource.id)]);
  });

  // `content` arrives as `unknown`, so a caller that never parsed it — blueprint deploy reads every manifest
  // Entry's content as `z.unknown()` — otherwise reaches the hook with the ISO string JSON.parse left behind
  // Where the type declares a Date, and the hook's TypeError is swallowed by its own best-effort wrapper
  test("parses the caller's content, so a hook declaring Dates never receives ISO strings", async () => {
    expect.hasAssertions();

    // What JSON.parse of a manifest blob leaves behind: a plain object with every Date serialized to the ISO
    // String it was written as, the due date the hook calls `.getTime()` on among them
    const { createdAt, deletedAt, id, notes, type, updatedAt } = item;
    const unrevivedContent: unknown = {
      items: [
        {
          createdAt: createdAt.toISOString(),
          deletedAt,
          dueAt: dueAt.toISOString(),
          id,
          name,
          notes,
          type,
          updatedAt: updatedAt.toISOString(),
        },
      ],
    };
    await saveResourceContent(ctx, { content: unrevivedContent, resource });
    await waitForSynchronizedFunctions();

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([createReminder(resource.id)]);
  });

  // The blob is not transactional, so a transaction that fails *after* the upload cannot be rolled back to match
  // It. For a Program that means the row can outlive the content it describes — and an unbind is the fail-open
  // Direction, because `resolveIdentifiedToken` reads the column and would keep accepting tokens the owner just
  // Revoked. So the failure has to land on null, which the resolver reads as "ask the blob"
  test("leaves no stale binding when the save fails after the content is written", async () => {
    expect.hasAssertions();

    const program = await createBoundProgram();
    // Rejected after the upload resolves, which is the only window the row and the blob can disagree in —
    // Rejecting the version bump instead would fail before the blob was ever written and prove nothing
    uploadMock.mockImplementationOnce(async (...parameters: Parameters<typeof uploadMock>) => {
      await uploadMock.getMockImplementation()?.(...parameters);
      throw new Error("rejected");
    });

    await expect(
      saveResourceContent(ctx, {
        content: unboundProgramContent,
        resource: program,
        updateContentVersion: (tx) => updateContentVersion(tx, program.id),
      }),
    ).rejects.toThrow("rejected");

    await expect(readBoundResourceId(program.id)).resolves.toBeNull();
  });

  // The other half of the same rule: a save that loses the version check never wrote its content, so it has no
  // Business clearing a binding the save that beat it just stored. Clearing inside the transaction is what makes
  // The loser's clear roll back with the rest of it
  test("leaves the binding alone when the save loses the content version check", async () => {
    expect.hasAssertions();

    const program = await createBoundProgram();

    await expect(
      saveResourceContent(ctx, {
        content: unboundProgramContent,
        resource: program,
        updateContentVersion: () => Promise.reject(new Error("stale")),
      }),
    ).rejects.toThrow("stale");

    await expect(readBoundResourceId(program.id)).resolves.toBe(surveyId);
  });

  // The one step a caller may opt out of, and only where `createResourceRow` has already opened the trail
  test("records no activity without an activityType", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();

    expect(readActivityTypes()).toStrictEqual([]);
  });
});
