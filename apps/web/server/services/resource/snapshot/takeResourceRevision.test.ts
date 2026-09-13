import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Context } from "@@/server/trpc/context";
import type { BlobDeletionEventGridData, Resource } from "@esposter/db-schema";

import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { getSnapshotObjectBlobName } from "@@/server/services/resource/snapshot/getSnapshotObjectBlobName";
import { readSnapshotHistory } from "@@/server/services/resource/snapshot/readSnapshotHistory";
import { readSnapshotVersionContent } from "@@/server/services/resource/snapshot/readSnapshotVersionContent";
import { takeResourceRevision } from "@@/server/services/resource/snapshot/takeResourceRevision";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { getContentBlobName } from "@esposter/db";
import {
  AzureContainer,
  resources,
  ResourceType,
  SnapshotChannel,
  SnapshotReason,
  storageLedger,
  users,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

const seedContentBlob = (id: Resource["id"], content: string) => {
  const container = MockContainerDatabase.get(AzureContainer.ResourceAssets) ?? new Map<string, Buffer>();
  container.set(getContentBlobName(id), Buffer.from(content));
  MockContainerDatabase.set(AzureContainer.ResourceAssets, container);
};

describe(takeResourceRevision, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: Resource;
  const name = "name";
  const serializedContent = JSON.stringify({ items: [] });
  // Content that shares nothing with the empty list, so a version holding it promotes to a keyframe of its own
  // Rather than anchoring to the one before it
  const rewrittenSerializedContent = JSON.stringify({
    items: Array.from({ length: 20 }, (_, index) => ({ id: crypto.randomUUID(), name: `${name} ${index}` })),
  });
  const { maxRetained } = SnapshotChannelDefinitionMap[SnapshotChannel.Revisions];
  const readStorageBytesUsed = async () =>
    (
      await mockContext.db.query.users.findFirst({
        columns: { storageBytesUsed: true },
        where: { id: { eq: ctx.getSessionPayload.user.id } },
      })
    )?.storageBytesUsed;
  const readResourceVersion = (version: number) =>
    mockContext.db.query.resourceVersions.findFirst({
      where: { channel: { eq: SnapshotChannel.Revisions }, resourceId: { eq: resource.id }, version: { eq: version } },
    });

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  beforeEach(async () => {
    resource = takeOne(
      await mockContext.db
        .insert(resources)
        .values({ name, type: ResourceType.TodoList, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    await mockContext.db.delete(resources);
    await mockContext.db.delete(storageLedger);
    await mockContext.db.update(users).set({ storageBytesUsed: 0 });
  });

  // The reason and the type's own one-line summary are what make a row choosable, and both are columns so the
  // Listing never has to open a version to say what one is
  test("stores the working copy under the revision channel with what it was taken for", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id, serializedContent);

    await expect(takeResourceRevision(ctx, resource, SnapshotReason.BeforeImport)).resolves.toBe(1);

    // A byte-for-byte copy: a revision is what the working copy *was*, never what today's schema makes of it
    await expect(
      readSnapshotVersionContent(mockContext.db, resource, { channel: SnapshotChannel.Revisions, version: 1 }),
    ).resolves.toStrictEqual({ items: [] });
    const [snapshotVersion] = await readSnapshotHistory(mockContext.db, resource.id, SnapshotChannel.Revisions);
    assert.exists(snapshotVersion);

    // The row's own clock is the service's, so the row is asserted whole minus the one field it dates
    const { takenAt, ...snapshotVersionRest } = snapshotVersion;

    expect(takenAt).toBeInstanceOf(Date);
    expect(snapshotVersionRest).toStrictEqual({
      channel: SnapshotChannel.Revisions,
      isCurrent: false,
      reason: SnapshotReason.BeforeImport,
      summary: "0 items",
      version: 1,
    });
    // Charged for what the object cost to store rather than for a copy of the document
    const resourceVersion = await readResourceVersion(1);
    assert.exists(resourceVersion);
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert.exists(container);

    expect(resourceVersion.storedBytes).toBe(
      container.get(getSnapshotObjectBlobName(resource.id, resourceVersion.hash))?.byteLength,
    );
    await expect(readStorageBytesUsed()).resolves.toBe(resourceVersion.storedBytes);
  });

  // The case that makes the meter honest about a save that changed nothing: the content is already held, so
  // The second version is a row pointing at the same object, with nothing written and nothing charged
  test("charges nothing for a revision whose content is already held", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id, serializedContent);
    await takeResourceRevision(ctx, resource, SnapshotReason.BeforeImport);
    const storageBytesUsed = await readStorageBytesUsed();
    await takeResourceRevision(ctx, resource, SnapshotReason.BeforeImport);

    await expect(readStorageBytesUsed()).resolves.toBe(storageBytesUsed);
    await expect(readSnapshotHistory(mockContext.db, resource.id, SnapshotChannel.Revisions)).resolves.toHaveLength(2);
    expect((await readResourceVersion(2))?.storedBytes).toBe(0);
  });

  // The clock the automatic trigger throttles on, which only a revision moves
  test("moves the revision clock onto the row", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id, serializedContent);
    await takeResourceRevision(ctx, resource, SnapshotReason.Automatic);
    const revisedResource = await mockContext.db.query.resources.findFirst({
      where: { id: { eq: resource.id } },
    });

    expect(revisedResource?.revisionTakenAt).toBeInstanceOf(Date);
  });

  // Every caller reads its row before it saves, so two concurrent saves both hold a clock from before either
  // Took a revision and both pass the caller-side interval check — the throttle only holds if the row itself
  // Refuses the second claim
  test("takes one automatic revision per interval however many claims race for it", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id, serializedContent);
    await Promise.all([
      takeResourceRevision(ctx, resource, SnapshotReason.Automatic),
      takeResourceRevision(ctx, resource, SnapshotReason.Automatic),
    ]);

    await expect(readSnapshotHistory(mockContext.db, resource.id, SnapshotChannel.Revisions)).resolves.toHaveLength(1);
  });

  // A deliberate take is the thing that makes one destructive act undoable, so it claims whatever the clock says
  test(`takes a ${SnapshotReason.BeforeRestore} revision inside an interval an automatic one already claimed`, async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id, serializedContent);
    await takeResourceRevision(ctx, resource, SnapshotReason.Automatic);

    await expect(takeResourceRevision(ctx, resource, SnapshotReason.BeforeRestore)).resolves.toBe(2);
  });

  // The ring buffer sheds the rows that fell out of the window, and only an object no surviving row names — as
  // Its own or as its base — goes to the deletion path that gives its bytes back
  test("evicts the oldest revision once the ring buffer is full and collects what nothing names", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id, serializedContent);
    await takeResourceRevision(ctx, resource, SnapshotReason.BeforeImport);
    const evictedVersion = await readResourceVersion(1);
    assert.exists(evictedVersion);
    seedContentBlob(resource.id, rewrittenSerializedContent);
    for (let version = 2; version <= maxRetained + 1; version++)
      await takeResourceRevision(ctx, resource, SnapshotReason.BeforeImport);
    const snapshotVersions = await readSnapshotHistory(mockContext.db, resource.id, SnapshotChannel.Revisions);

    expect(snapshotVersions).toHaveLength(maxRetained);
    expect(snapshotVersions[0]?.version).toBe(2);
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    expect(takeOne(blobDeletionEvents, blobDeletionEvents.length - 1).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [getSnapshotObjectBlobName(resource.id, evictedVersion.hash)],
      containerName: AzureContainer.ResourceAssets,
    });
  });

  test("takes nothing below the ring buffer's cap", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id, serializedContent);
    await takeResourceRevision(ctx, resource, SnapshotReason.Automatic);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  // The triggers that take one before overwriting a draft reach a resource created and never saved exactly
  // Like any other, so "there is nothing to keep" is an answer rather than a failure
  test("answers with nothing when the resource has no content yet", async () => {
    expect.hasAssertions();

    await expect(takeResourceRevision(ctx, resource, SnapshotReason.BeforeRestore)).resolves.toBeUndefined();
    await expect(
      mockContext.db.query.resources.findFirst({
        columns: { revisionVersion: true },
        where: { id: { eq: resource.id } },
      }),
    ).resolves.toStrictEqual({ revisionVersion: 0 });
  });
});
