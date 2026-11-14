import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";

import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { saveResourceContent } from "#server/services/resource/saveResourceContent";
import { readSnapshotHistory } from "#server/services/resource/snapshot/readSnapshotHistory";
import { readSnapshotVersionContent } from "#server/services/resource/snapshot/readSnapshotVersionContent";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createTestImageNode } from "#shared/services/pageBuilder/constants.test";
import {
  ASSET_DECISION_CLOCK_MARGIN_MS,
  ASSET_GRACE_MS,
  SNAPSHOT_INTERVAL_MS,
} from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { deleteDirectory, getContentBlobName, reconcileStorageLedgerEntry } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  QueueJob,
  getResourceFileBlobName,
  resourceActivitiesInResource,
  ResourceActivityType,
  resourceLinksInResource,
  ResourceLinkType,
  resourcesInResource,
  ResourceType,
  resourceWorkingAssetsInResource,
  SnapshotChannel,
  SnapshotReason,
  StorageBucket,
  storageLedgerInStorage,
  usersInAuth,
} from "@esposter/db-schema";
import { jsonDateParse, takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { PositionedElementType } from "vue-block-editor-headless";
import { MockJobQueueDatabase } from "#server/services/queue/getJobQueue.test";

// The upload is the seam a post-blob failure has to be injected at: it is the only step between the version bump
// And the commit that is not transactional, so rejecting anything earlier proves nothing about the window where
// The row and the blob can disagree. The charge is the seam between the commit and the binding stored after it,
// Where a newer save can land. Both delegate to the real call by default, so every other test is unaffected
const { chargeMock, uploadMock } = vi.hoisted(() => ({
  chargeMock: vi.fn<typeof import("@esposter/db").chargeStorageLedgerEntry>(),
  uploadMock: vi.fn<typeof import("@esposter/db").writeJsonBlob>(),
}));

vi.mock(import("@esposter/db"), async (importOriginal) => {
  const original = await importOriginal();
  chargeMock.mockImplementation(original.chargeStorageLedgerEntry);
  uploadMock.mockImplementation(original.writeJsonBlob);
  return { ...original, chargeStorageLedgerEntry: chargeMock, writeJsonBlob: uploadMock };
});

// The one place a resource's content blob is written, so its whole tail — the save event, the activity entry
// And the type's registered after-save hook — is asserted here once. TodoList is the representative type: it is
// The one with a registered after-save hook
// Each page names an image by the url of its own blob, so the content and the blobs are built from one resource id
const createWebpageContent = (resourceId: ResourceInResource["id"], hashes: string[]) =>
  new WebpageEditor({
    content: hashes.map((hash) => createTestImageNode(getResourceAssetUrl(getResourceFileBlobName(resourceId, hash)))),
  });

describe(saveResourceContent, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: ResourceInResource;
  const readActivityTypes = async () =>
    (
      await mockContext.db
        .select({ activityType: resourceActivitiesInResource.activityType })
        .from(resourceActivitiesInResource)
        .where(eq(resourceActivitiesInResource.resourceId, resource.id))
    ).map(({ activityType }) => activityType);
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;
  const name = "name";
  const surveyId = v7();
  const unboundProgramContent = { emailId: "", keyColumn: "", surveyId: "" };
  // A Program already bound to a survey, which is the only state an unbind can be observed from
  const createBoundProgram = async () => {
    const program = takeOne(
      await ctx.db
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Program, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
    await ctx.db
      .insert(resourceLinksInResource)
      .values({ sourceId: program.id, targetId: surveyId, type: ResourceLinkType.Survey });
    return program;
  };
  const readStorageBytesUsed = async () =>
    (
      await mockContext.db.query.usersInAuth.findFirst({
        columns: { storageBytesUsed: true },
        where: { id: { eq: ctx.getSessionPayload.user.id } },
      })
    )?.storageBytesUsed;
  const getStoredContentBytes = async () => (await bucket.head(getContentBlobName(resource.id)))?.size;
  const readStoredVersionBytes = async () =>
    (
      await mockContext.db.query.resourceVersionsInResource.findMany({
        columns: { storedBytes: true },
        where: { resourceId: { eq: resource.id } },
      })
    ).reduce((total, { storedBytes }) => total + storedBytes, 0);
  const readResourceLinkTargets = (sourceId: ResourceInResource["id"]) =>
    ctx.db.query.resourceLinksInResource.findMany({
      columns: { targetId: true, type: true },
      where: { sourceId: { eq: sourceId } },
    });
  // The revision clock lives on the row, so a save that reuses the row it was handed last time never sees it
  // Move — which is the whole of what the throttle reads. Every save the revision tests make goes through here
  const saveLatestResourceContent = async (newContent: TodoListResource) => {
    const latestResource = await ctx.db.query.resourcesInResource.findFirst({ where: { id: { eq: resource.id } } });
    assert.exists(latestResource);
    await saveResourceContent(ctx, {
      activityType: ResourceActivityType.ContentSaved,
      content: newContent,
      resource: latestResource,
    });
  };
  const readRevisionCount = async () =>
    (await readSnapshotHistory(mockContext.db, resource.id, SnapshotChannel.Revisions)).length;
  // The clock is pinned at the epoch, so the smallest future instant is all a reminder needs to be scheduled
  const dueAt = new Date(1);
  const item = new TodoListItem({ dueAt, name });
  const content: TodoListResource = { items: [item] };
  // Storage's own per-blob ordering value, as the first save's event would carry it
  const sequencer = "0";
  const { contentSchema } = ResourceDefinitionMap[ResourceType.TodoList];
  const createReminderCall = (resource: Pick<ResourceInResource, "id" | "userId">) => ({
    args: [
      {
        cancelledItemIds: [],
        reminders: [{ dueAt, itemId: item.id, resourceId: resource.id }],
        resourceId: resource.id,
      },
    ],
    method: "reconcileTodoReminders",
    userId: resource.userId,
  });
  const getReminderCalls = () => userObjectCalls.filter(({ method }) => method === "reconcileTodoReminders");
  const assetHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
  const otherAssetHash = "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae";
  const assetBytes = new Uint8Array(1);
  const createWebpage = async () =>
    takeOne(
      await mockContext.db
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Webpage, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  const uploadAssetBlob = async (resourceId: ResourceInResource["id"], hash: string) => {
    await bucket.put(getResourceFileBlobName(resourceId, hash), assetBytes);
  };
  const readWorkingAssetHashes = async (resourceId: ResourceInResource["id"]) =>
    (
      await mockContext.db
        .select({ assetHash: resourceWorkingAssetsInResource.assetHash })
        .from(resourceWorkingAssetsInResource)
        .where(eq(resourceWorkingAssetsInResource.resourceId, resourceId))
    )
      .map((workingRow) => workingRow.assetHash)
      .toSorted();

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
    mockBuckets[StorageBucket.ResourceAssets] = bucket;
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0 });
    resource = takeOne(
      await mockContext.db
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.TodoList, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  });

  afterAll(async () => {
    await dispose();
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    await deleteDirectory(bucket);
    MockJobQueueDatabase.clear();
    userObjectCalls.length = 0;
    await mockContext.db.delete(resourcesInResource);
    // The ledger is keyed by user, not by resource, so it outlives the rows above — and every test here saves
    // Content, which now charges the counter
    await mockContext.db.delete(storageLedgerInStorage);
    await mockContext.db.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  // A resource's first save has nothing behind it to keep — the blob it would snapshot is the one this save
  // Is about to write
  test("keeps no revision for the save that creates the content", async () => {
    expect.hasAssertions();

    await saveLatestResourceContent(content);

    await expect(readSnapshotHistory(mockContext.db, resource.id, SnapshotChannel.Revisions)).resolves.toStrictEqual(
      [],
    );
  });

  test("keeps a revision of what a save replaces once there is content to keep", async () => {
    expect.hasAssertions();

    await saveLatestResourceContent(content);
    await saveLatestResourceContent({ items: [] });

    // The revision holds the content this save replaced, not the content it wrote — a point to return *to*
    await expect(
      readSnapshotVersionContent(mockContext.db, resource, { channel: SnapshotChannel.Revisions, version: 1 }),
    ).resolves.toStrictEqual(contentSchema.parse(jsonDateParse(JSON.stringify(content))));
    const snapshotVersions = await readSnapshotHistory(mockContext.db, resource.id, SnapshotChannel.Revisions);
    const snapshotVersion = takeOne(snapshotVersions);

    expect(snapshotVersion.reason).toBe(SnapshotReason.Automatic);
    expect(snapshotVersion.version).toBe(1);
  });

  // One revision per interval rather than per save, which is what SNAPSHOT_INTERVAL_MS is for
  test("keeps no second revision for a save inside the interval", async () => {
    expect.hasAssertions();

    await saveLatestResourceContent(content);
    await saveLatestResourceContent({ items: [] });
    await saveLatestResourceContent({ items: [item] });

    await expect(readRevisionCount()).resolves.toBe(1);
  });

  // The interval is measured from the last revision rather than from the last save, so an owner who never stops
  // Typing still leaves points behind them — measured from the save clock this resource would never look idle
  // And the whole session would be unrecoverable
  test("keeps a revision per interval through a session that is never idle", async () => {
    expect.hasAssertions();

    await saveLatestResourceContent(content);
    // Well inside the interval, so no save here is ever the first after a quiet spell
    for (let saveCount = 0; saveCount < 6; saveCount++) {
      vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS / 2);
      // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: every save lands after the timer advance before it
      await saveLatestResourceContent({ items: saveCount % 2 === 0 ? [] : [item] });
    }

    await expect(readRevisionCount()).resolves.toBe(3);
  });

  test("writes the content, emits the save, records the activity and runs the after-save hook as one unit", async () => {
    expect.hasAssertions();

    const savedResource = await saveResourceContent(ctx, {
      activityType: ResourceActivityType.ContentSaved,
      content,
      contentVersion: resource.contentVersion,
      resource,
    });
    await waitForSynchronizedFunctions();
    const storedContent = await readResourceContent(contentSchema, resource.id);
    const saveEvent = userObjectCalls.find(({ method }) => method === "saveResourceContent")?.args[0];
    assert.exists(saveEvent);

    expect(savedResource.contentVersion).toBe(resource.contentVersion + 1);
    expect(storedContent).toStrictEqual(jsonDateParse(JSON.stringify(content)));
    // The event carries the version the update returned, so a subscriber's next save is not rejected as stale, and
    // Names the resource alone: the content is re-read by whoever hears it
    expect(saveEvent).toStrictEqual({ apiKeyName: "", contentVersion: savedResource.contentVersion, id: resource.id });
    await expect(readActivityTypes()).resolves.toStrictEqual([ResourceActivityType.ContentSaved]);
    expect(getReminderCalls()).toStrictEqual([createReminderCall(resource)]);
  });

  // Every save rewrites the same blob name and raises its own `BlobCreated` behind it, which settles that name
  // From the Functions host seconds later. So the counter has to follow the save that comes after one of those
  // Events, or the owner's meter moves on their first save of a resource and never again
  test("keeps the counter in step with a save that follows the blob's own event", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    const contentBlobName = getContentBlobName(resource.id);
    const firstStoredContent = await bucket.head(contentBlobName);
    assert.exists(firstStoredContent);
    // The first save's own event, arriving with the position storage wrote the blob in
    await reconcileStorageLedgerEntry(
      mockContext.db,
      StorageBucket.ResourceAssets,
      contentBlobName,
      firstStoredContent.size,
      sequencer,
    );
    await saveResourceContent(ctx, { content: { items: [item, new TodoListItem({ dueAt, name })] }, resource });
    const storedContent = await bucket.head(contentBlobName);
    assert.exists(storedContent);

    expect(storedContent.size).toBeGreaterThan(firstStoredContent.size);
    await expect(readStorageBytesUsed()).resolves.toBe(storedContent.size);
  });

  // A revision is charged for what its object cost to store rather than for a copy of the content — so the
  // Counter carries the working copy plus what each interval's recovery point added, which is the only path that
  // Grows it without a bigger document behind it
  test("charges a revision on top of the content once per interval", async () => {
    expect.hasAssertions();

    await saveLatestResourceContent(content);

    await expect(readStorageBytesUsed()).resolves.toBe(await getStoredContentBytes());

    await saveLatestResourceContent({ items: [] });
    const firstRevisionBytes = await readStoredVersionBytes();

    // The exact figure is the compressed size of the revision, which moves with the content rather than with the
    // Metering under test — so what is asserted is that it moved off zero, without which the sum below passes
    // Vacuously
    expect(firstRevisionBytes).toBeGreaterThan(0);
    await expect(readStorageBytesUsed()).resolves.toBe(((await getStoredContentBytes()) ?? 0) + firstRevisionBytes);

    // A second interval, so the growth is shown to be per interval rather than a one-off first revision
    vi.advanceTimersByTime(SNAPSHOT_INTERVAL_MS);
    await saveLatestResourceContent(content);
    const secondRevisionBytes = await readStoredVersionBytes();

    expect(secondRevisionBytes).toBeGreaterThan(firstRevisionBytes);
    await expect(readStorageBytesUsed()).resolves.toBe(((await getStoredContentBytes()) ?? 0) + secondRevisionBytes);
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
    expect(getReminderCalls()).toStrictEqual([createReminderCall(resource)]);
  });

  // `content` arrives as `unknown`, so a caller that never parsed it — blueprint deploy reads every manifest
  // Entry's content as `z.unknown()` — otherwise reaches the hook with the ISO string JSON.parse left behind
  // Where the type declares a Date, and the hook's TypeError is swallowed by its own best-effort wrapper
  test("parses the caller's content, so a hook declaring Dates never receives ISO strings", async () => {
    expect.hasAssertions();

    // What JSON.parse of a manifest blob leaves behind: a plain object with every Date serialized to the ISO
    // String it was written as, the due date the hook calls `.getTime()` on among them
    const { createdAt, id, notes, updatedAt } = item;
    const unrevivedContent: unknown = {
      items: [
        {
          createdAt: createdAt.toISOString(),
          dueAt: dueAt.toISOString(),
          id,
          name,
          notes,
          updatedAt: updatedAt.toISOString(),
        },
      ],
    };
    await saveResourceContent(ctx, { content: unrevivedContent, resource });
    await waitForSynchronizedFunctions();

    expect(getReminderCalls()).toStrictEqual([createReminderCall(resource)]);
  });

  // The blob is not transactional, so a transaction failing after the upload cannot be rolled back to match it:
  // For a Program the row can outlive the content it describes, and an unbind is the fail-open direction because
  // `resolveIdentifiedToken` would keep accepting tokens the owner just revoked. So the failure lands on no links,
  // Which authorize nothing until the next save writes them again
  test("leaves no stale link when the save fails after the content is written", async () => {
    expect.hasAssertions();

    const program = await createBoundProgram();
    // Rejected after the upload resolves, which is the only window the row and the blob can disagree in —
    // Rejecting the version bump instead would fail before the blob was ever written and prove nothing
    uploadMock.mockImplementationOnce(async (...parameters: Parameters<typeof uploadMock>) => {
      await uploadMock.getMockImplementation()?.(...parameters);
      throw new Error(" ");
    });

    await expect(
      saveResourceContent(ctx, {
        content: unboundProgramContent,
        contentVersion: program.contentVersion,
        resource: program,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    await expect(readResourceLinkTargets(program.id)).resolves.toStrictEqual([]);
  });

  // The other half of the same rule: a save that loses the version check never wrote its content, so it has no
  // Business clearing links the save that beat it just stored. Clearing inside the transaction is what makes
  // The loser's clear roll back with the rest of it
  test("leaves the links alone when the save loses the content version check", async () => {
    expect.hasAssertions();

    const program = await createBoundProgram();

    await expect(
      saveResourceContent(ctx, {
        content: unboundProgramContent,
        contentVersion: program.contentVersion + 1,
        resource: program,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, cannot save resource content with old content version]`,
    );

    await expect(readResourceLinkTargets(program.id)).resolves.toStrictEqual([
      { targetId: surveyId, type: ResourceLinkType.Survey },
    ]);
  });

  // The links are stored after the transaction that bumped the version, so a save committing first can reach
  // That write last and flatten a newer save's links, which the established version guards against. Stood in
  // For rather than raced: the charge between the commit and that write bumps the row the way the save that beat
  // This one would have
  test("leaves a newer save's links alone when its own version has been superseded", async () => {
    expect.hasAssertions();

    const program = await createBoundProgram();
    const otherSurveyId = v7();
    chargeMock.mockImplementationOnce(async (...parameters: Parameters<typeof chargeMock>) => {
      await ctx.db
        .update(resourcesInResource)
        .set({ contentVersion: program.contentVersion + 2 })
        .where(eq(resourcesInResource.id, program.id));
      await chargeMock.getMockImplementation()?.(...parameters);
    });

    await saveResourceContent(ctx, {
      content: { ...unboundProgramContent, surveyId: otherSurveyId },
      contentVersion: program.contentVersion,
      resource: program,
    });

    // None, not `otherSurveyId`: the clear inside the transaction stands, and the write after it finds no row
    await expect(readResourceLinkTargets(program.id)).resolves.toStrictEqual([]);
  });

  test("stores an unbound Program's empty ids as no links", async () => {
    expect.hasAssertions();

    const program = await createBoundProgram();

    await saveResourceContent(ctx, {
      content: unboundProgramContent,
      contentVersion: program.contentVersion,
      resource: program,
    });

    await expect(readResourceLinkTargets(program.id)).resolves.toStrictEqual([]);
  });

  test("stores one link for a target several fields bind", async () => {
    expect.hasAssertions();

    const sheetId = v7();
    const dataset = {
      query: { series: [{ aggregation: DatasetAggregationType.Count, column: name }], xColumn: name },
      reference: { id: sheetId, type: DatasetProviderType.Sheet },
    };
    const dashboard = takeOne(
      await ctx.db
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Dashboard, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );

    await saveResourceContent(ctx, {
      content: new Dashboard({ visuals: [new Visual({ dataset }), new Visual({ dataset })] }),
      contentVersion: dashboard.contentVersion,
      resource: dashboard,
    });

    await expect(readResourceLinkTargets(dashboard.id)).resolves.toStrictEqual([
      { targetId: sheetId, type: ResourceLinkType.Dataset },
    ]);
  });

  // The one step a caller may opt out of, and only where `createResourceRow` has already opened the trail
  test("records no activity without an activityType", async () => {
    expect.hasAssertions();

    await saveResourceContent(ctx, { content, resource });
    await waitForSynchronizedFunctions();

    await expect(readActivityTypes()).resolves.toStrictEqual([]);
  });

  test("references the assets the content embeds and drops the ones a later save no longer embeds", async () => {
    expect.hasAssertions();

    const webpage = await createWebpage();
    await uploadAssetBlob(webpage.id, assetHash);
    await uploadAssetBlob(webpage.id, otherAssetHash);
    await saveResourceContent(ctx, {
      content: createWebpageContent(webpage.id, [assetHash, otherAssetHash]),
      resource: webpage,
    });

    await expect(readWorkingAssetHashes(webpage.id)).resolves.toStrictEqual([assetHash, otherAssetHash].toSorted());

    // Past the grace window the upload restarted, so the dropped asset is deleted rather than kept. R2 stamps an upload
    // With its own clock, so the window is measured from the moment that object was written
    const droppedAsset = await bucket.head(getResourceFileBlobName(webpage.id, otherAssetHash));
    assert.exists(droppedAsset);
    vi.setSystemTime(droppedAsset.uploaded.getTime() + ASSET_GRACE_MS);
    await saveResourceContent(ctx, { content: createWebpageContent(webpage.id, [assetHash]), resource: webpage });

    await expect(readWorkingAssetHashes(webpage.id)).resolves.toStrictEqual([assetHash]);
    expect(takeOne(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion) ?? [])).toStrictEqual({
      blobNames: [getResourceFileBlobName(webpage.id, otherAssetHash)],
      containerName: StorageBucket.ResourceAssets,
      decidedAt: new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS),
    });
  });

  test("references the file a whiteboard image names by its bare id", async () => {
    expect.hasAssertions();

    const whiteboard = takeOne(
      await mockContext.db
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Whiteboard, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );

    await saveResourceContent(ctx, {
      content: {
        elements: [
          {
            altText: "",
            fileId: assetHash,
            height: 100,
            id: v7(),
            type: PositionedElementType.Image,
            width: 100,
            x: 0,
            y: 0,
          },
        ],
      },
      resource: whiteboard,
    });

    await expect(readWorkingAssetHashes(whiteboard.id)).resolves.toStrictEqual([assetHash]);
  });

  test("stores content naming an asset that is not stored, and references it", async () => {
    expect.hasAssertions();

    const webpage = await createWebpage();

    const savedWebpage = await saveResourceContent(ctx, {
      content: createWebpageContent(webpage.id, [assetHash]),
      contentVersion: webpage.contentVersion,
      resource: webpage,
    });

    expect(savedWebpage.contentVersion).toBe(webpage.contentVersion + 1);
    await expect(readWorkingAssetHashes(webpage.id)).resolves.toStrictEqual([assetHash]);
  });

  // The upload is rejected after it resolves, so the blob may already hold the new content while the rows still have
  // To name its assets. They keep the old content's too, rather than dropping to the new content's alone
  test("keeps the previous content's assets referenced when the upload fails", async () => {
    expect.hasAssertions();

    const webpage = await createWebpage();
    await uploadAssetBlob(webpage.id, assetHash);
    await uploadAssetBlob(webpage.id, otherAssetHash);
    await saveResourceContent(ctx, { content: createWebpageContent(webpage.id, [assetHash]), resource: webpage });
    uploadMock.mockImplementationOnce(async (...parameters: Parameters<typeof uploadMock>) => {
      await uploadMock.getMockImplementation()?.(...parameters);
      throw new Error(" ");
    });

    await expect(
      saveResourceContent(ctx, { content: createWebpageContent(webpage.id, [otherAssetHash]), resource: webpage }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    await expect(readWorkingAssetHashes(webpage.id)).resolves.toStrictEqual([assetHash, otherAssetHash].toSorted());
  });
});
