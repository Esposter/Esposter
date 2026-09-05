import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { SNAPSHOT_IDLE_WINDOW_MS } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { getSnapshotContentBlobName } from "@@/server/services/resource/snapshot/getSnapshotContentBlobName";
import { readSnapshotHistory } from "@@/server/services/resource/snapshot/readSnapshotHistory";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { getContentBlobName, reconcileStorageLedgerEntry } from "@esposter/db";
import {
  AzureContainer,
  AzureQueue,
  AzureTable,
  ResourceActivityType,
  resources,
  ResourceType,
  storageLedger,
  users,
} from "@esposter/db-schema";
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
// And the type's registered after-save hook — is asserted here once. TodoList is the representative type: it is
// The one with a registered after-save hook
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
  const readStorageBytesUsed = async () =>
    (
      await mockContext.db.query.users.findFirst({
        columns: { storageBytesUsed: true },
        where: { id: { eq: ctx.getSessionPayload.user.id } },
      })
    )?.storageBytesUsed;
  const readBoundResourceId = async (id: Resource["id"]) =>
    (await ctx.db.query.resources.findFirst({ where: { id: { eq: id } } }))?.boundResourceId;
  // The clock is pinned at the epoch, so the smallest future instant is all a reminder needs to be scheduled
  const dueAt = new Date(1);
  const item = new TodoListItem({ dueAt, name });
  const content: TodoListResource = { items: [item] };
  // Storage's own per-blob ordering value, as the first save's event would carry it
  const sequencer = "0000000000000abc000000000000000000001";
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
    // The ledger is keyed by user, not by resource, so it outlives the rows above — and every test here saves
    // Content, which now charges the counter
    await mockContext.db.delete(storageLedger);
    await mockContext.db.update(users).set({ storageBytesUsed: 0 });
  });

  // One revision per idle window rather than per save, which is what SNAPSHOT_IDLE_WINDOW_MS is for
  test("keeps no revision for a save inside the idle window", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { activityType: ResourceActivityType.ContentSaved, content, resource });

    await expect(readSnapshotHistory(resource.id, SnapshotChannel.Revisions)).resolves.toStrictEqual([]);
  });

  test("keeps a revision of what the first save after an idle window replaces", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { activityType: ResourceActivityType.ContentSaved, content, resource });
    vi.advanceTimersByTime(SNAPSHOT_IDLE_WINDOW_MS);
    await saveResourceContent(ctx, {
      activityType: ResourceActivityType.ContentSaved,
      content: { items: [] },
      resource,
    });
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert.exists(container);

    // The revision holds the content this save replaced, not the content it wrote — a point to return *to*
    expect(
      jsonDateParse(
        container.get(getSnapshotContentBlobName(resource.id, SnapshotChannel.Revisions, 1))?.toString() ?? "",
      ),
    ).toStrictEqual(jsonDateParse(JSON.stringify(content)));
    const [snapshotVersion] = await readSnapshotHistory(resource.id, SnapshotChannel.Revisions);

    expect(snapshotVersion?.reason).toBe(SnapshotReason.Automatic);
    expect(snapshotVersion?.version).toBe(1);
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

  // A content blob has no reserve behind it to ledger it, so the save itself is what charges the owner — and
  // For the blob's own size, which is the only number the meter can be right about
  test("charges the owner for the content blob it stored", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    const storedContent = MockContainerDatabase.get(AzureContainer.ResourceAssets)?.get(
      getContentBlobName(resource.id),
    );
    assert.exists(storedContent);

    await expect(readStorageBytesUsed()).resolves.toBe(storedContent.byteLength);
  });

  // Every save rewrites the same blob name and raises its own `BlobCreated` behind it, which settles that name
  // From the Functions host seconds later. So the counter has to follow the save that comes after one of those
  // Events, or the owner's meter moves on their first save of a resource and never again
  test("keeps the counter in step with a save that follows the blob's own event", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    const contentBlobName = getContentBlobName(resource.id);
    const firstStoredContent = MockContainerDatabase.get(AzureContainer.ResourceAssets)?.get(contentBlobName);
    assert.exists(firstStoredContent);
    // The first save's own event, arriving with the position storage wrote the blob in
    await reconcileStorageLedgerEntry(
      mockContext.db,
      AzureContainer.ResourceAssets,
      contentBlobName,
      firstStoredContent.byteLength,
      sequencer,
    );
    await saveResourceContent(ctx, { content: { items: [item, new TodoListItem({ dueAt, name })] }, resource });
    const storedContent = MockContainerDatabase.get(AzureContainer.ResourceAssets)?.get(contentBlobName);
    assert.exists(storedContent);

    expect(storedContent.byteLength).toBeGreaterThan(firstStoredContent.byteLength);
    await expect(readStorageBytesUsed()).resolves.toBe(storedContent.byteLength);
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

  // The blob is not transactional, so a transaction failing after the upload cannot be rolled back to match it:
  // For a Program the row can outlive the content it describes, and an unbind is the fail-open direction because
  // `resolveIdentifiedToken` would keep accepting tokens the owner just revoked. So the failure lands on null,
  // Which the resolver reads as "ask the blob"
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: rejected]`);

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
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: stale]`);

    await expect(readBoundResourceId(program.id)).resolves.toBe(surveyId);
  });

  // The binding is stored after the transaction that bumped the version, so a save committing first can reach
  // That write last and flatten a newer save's binding, which the established version guards against. Stood in
  // For rather than raced: the callback bumps the row the way the save that beat this one would have, and returns
  // The row this save wrote — the pair of facts the losing save holds
  test("leaves a newer save's binding alone when its own version has been superseded", async () => {
    expect.hasAssertions();

    const program = await createBoundProgram();
    const otherSurveyId = crypto.randomUUID();

    await saveResourceContent(ctx, {
      content: { ...unboundProgramContent, surveyId: otherSurveyId },
      resource: program,
      updateContentVersion: async (tx) => {
        const supersededResource = takeOne(
          await tx.update(resources).set({ contentVersion: 1 }).where(eq(resources.id, program.id)).returning(),
        );
        await tx.update(resources).set({ contentVersion: 2 }).where(eq(resources.id, program.id));
        return supersededResource;
      },
    });

    // Null, not `otherSurveyId`: the clear inside the transaction stands, and the store after it finds no row
    await expect(readBoundResourceId(program.id)).resolves.toBeNull();
  });

  // The one step a caller may opt out of, and only where `createResourceRow` has already opened the trail
  test("records no activity without an activityType", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();

    expect(readActivityTypes()).toStrictEqual([]);
  });
});
