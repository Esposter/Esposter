import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Context } from "@@/server/trpc/context";
import type { BlobDeletionEventGridData, Resource } from "@esposter/db-schema";

import { CsvDelimiter } from "#shared/models/resource/sheet/csv/CsvDelimiter";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { getSnapshotContentBlobName } from "@@/server/services/resource/snapshot/getSnapshotContentBlobName";
import { readSnapshotHistory } from "@@/server/services/resource/snapshot/readSnapshotHistory";
import { takeResourceRevision } from "@@/server/services/resource/snapshot/takeResourceRevision";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { getContentBlobName } from "@esposter/db";
import { AzureContainer, resources, ResourceType, storageLedger, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(takeResourceRevision, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: Resource;
  const name = "name";
  const serializedContent = JSON.stringify({ items: [] });
  const { maxRetained } = SnapshotChannelDefinitionMap[SnapshotChannel.Revisions];
  const seedContentBlob = (id: Resource["id"]) => {
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets) ?? new Map<string, Buffer>();
    container.set(getContentBlobName(id), Buffer.from(serializedContent));
    MockContainerDatabase.set(AzureContainer.ResourceAssets, container);
  };
  const readStorageBytesUsed = async () =>
    (
      await mockContext.db.query.users.findFirst({
        columns: { storageBytesUsed: true },
        where: { id: { eq: ctx.getSessionPayload.user.id } },
      })
    )?.storageBytesUsed;

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

  // The reason and the type's own one-line summary are what make a row choosable, and both ride the blob's own
  // Metadata so the listing never has to open a snapshot to say what one is
  test("writes the working copy under the revision channel with what it was taken for", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id);

    await expect(takeResourceRevision(ctx, resource, SnapshotReason.BeforeImport)).resolves.toBe(1);

    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert.exists(container);

    // A byte-for-byte copy: a revision is what the working copy *was*, never what today's schema makes of it
    expect(container.get(getSnapshotContentBlobName(resource.id, SnapshotChannel.Revisions, 1))?.toString()).toBe(
      serializedContent,
    );
    const [snapshotVersion] = await readSnapshotHistory(resource.id, SnapshotChannel.Revisions);
    assert.exists(snapshotVersion);

    // The blob's lastModified is the service's own, so the row is asserted whole minus the one field it dates
    const { takenAt, ...snapshotVersionRest } = snapshotVersion;

    expect(takenAt).toBeInstanceOf(Date);
    expect(snapshotVersionRest).toStrictEqual({
      channel: SnapshotChannel.Revisions,
      isCurrent: false,
      reason: SnapshotReason.BeforeImport,
      summary: "0 items",
      version: 1,
    });
    // Stored bytes the owner keeps, charged like the working copy it came from
    await expect(readStorageBytesUsed()).resolves.toBe(Buffer.byteLength(serializedContent));
  });

  // A summary is built from the type's own words and metadata travels as http headers — Sheet's separator is
  // Already outside ascii, so it is encoded on the way in and has to come back as what it was rather than as
  // Its encoding
  test("round-trips a summary that is not spellable in ascii", async () => {
    expect.hasAssertions();

    const sheetResource = takeOne(
      await mockContext.db
        .insert(resources)
        .values({ name, type: ResourceType.Sheet, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
    const sheetContent: SheetResource = {
      data: {
        columns: [],
        metadata: { dataSourceType: DataSourceType.Csv, importedAt: new Date(0), name: "", size: 0 },
        rows: [],
      },
      settings: { configuration: { delimiter: CsvDelimiter.Comma }, type: DataSourceType.Csv },
    };
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets) ?? new Map<string, Buffer>();
    container.set(getContentBlobName(sheetResource.id), Buffer.from(JSON.stringify(sheetContent)));
    MockContainerDatabase.set(AzureContainer.ResourceAssets, container);
    await takeResourceRevision(ctx, sheetResource, SnapshotReason.Automatic);
    const [snapshotVersion] = await readSnapshotHistory(sheetResource.id, SnapshotChannel.Revisions);

    expect(snapshotVersion?.summary).toBe("0 columns · 0 rows");
  });

  // The clock the automatic trigger throttles on, which only a revision moves
  test("moves the revision clock onto the row", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id);
    await takeResourceRevision(ctx, resource, SnapshotReason.Automatic);
    const revisedResource = await mockContext.db.query.resources.findFirst({
      where: { id: { eq: resource.id } },
    });

    expect(revisedResource?.revisionTakenAt).toBeInstanceOf(Date);
  });

  // The counter is the ring's position, so eviction is one publish rather than a walk of the prefix on every
  // Save, and it goes through the deletion event that gives the evicted revision's bytes back
  test("evicts the oldest revision once the ring buffer is full", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id);
    await mockContext.db.update(resources).set({ revisionVersion: maxRetained }).where(eq(resources.id, resource.id));
    const filledResource = { ...resource, revisionVersion: maxRetained };
    await takeResourceRevision(ctx, filledResource, SnapshotReason.Automatic);
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    expect(takeOne(blobDeletionEvents, blobDeletionEvents.length - 1).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [getSnapshotContentBlobName(resource.id, SnapshotChannel.Revisions, 1)],
      containerName: AzureContainer.ResourceAssets,
    });
  });

  test("takes nothing below the ring buffer's cap", async () => {
    expect.hasAssertions();

    seedContentBlob(resource.id);
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
