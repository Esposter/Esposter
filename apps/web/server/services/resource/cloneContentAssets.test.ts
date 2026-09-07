import type { ContainerClient } from "@azure/storage-blob";
import type { Database } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { FILES_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { containerClientMock } = vi.hoisted(() => ({
  containerClientMock: {} as { current: ContainerClient },
}));

vi.mock(import("@@/server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

// A stub answering the two readability questions, which is what lets these cases count the queries the cache
// Collapses. The charge every clone makes is asserted where a real database exists — the publish and duplicate
// Router tests — rather than faked into this one
vi.mock(import("@esposter/db"), async (importOriginal) => ({
  ...(await importOriginal()),
  chargeStorageLedgerEntry: () => Promise.resolve(),
}));

describe(cloneContentAssets, () => {
  const userId = crypto.randomUUID();
  const sourceResourceId = crypto.randomUUID();
  const destinationResourceId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const filename = "a";
  // Duplicate passes the new resource id; publish passes that id's publish directory.
  const destinationDirectoryName = destinationResourceId;
  const filesRelativeName = `${FILES_DIRECTORY_SEGMENT}/${fileId}${ID_SEPARATOR}${filename}`;
  const workingBlobName = `${sourceResourceId}/${filesRelativeName}`;
  const siblingWorkingBlobName = `${sourceResourceId}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
  const publishedBlobName = `${sourceResourceId}/${SnapshotChannel.Published}/${crypto.randomUUID()}/${filesRelativeName}`;
  // The clone asks the same question the serving endpoint does, so the rows that answer it are what a case here
  // Varies: an owned working copy is readable, an unowned one is not, and neither has a publication row
  const createDatabase = (isOwned: boolean) => {
    const findFirstResource = vi.fn<() => Promise<undefined | { id: string }>>(() =>
      Promise.resolve(isOwned ? { id: sourceResourceId } : undefined),
    );
    return {
      db: {
        query: {
          resourcePublications: { findFirst: () => Promise.resolve(undefined) },
          resources: { findFirst: findFirstResource },
          // The clone announces the owner's new total once it is done, and reads it from here to do so
          users: { findFirst: () => Promise.resolve(undefined) },
        },
      } as unknown as Database,
      findFirstResource,
    };
  };
  let containerClient: MockContainerClient;

  beforeEach(async () => {
    containerClient = new MockContainerClient("", "resource-assets");
    containerClientMock.current = containerClient as unknown as ContainerClient;
    for (const blobName of [workingBlobName, publishedBlobName])
      await containerClient.getBlockBlobClient(blobName).upload(blobName, blobName.length);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
  });

  const getClonedBlobNames = async () => {
    const blobNames: string[] = [];
    for await (const { name } of containerClient.listBlobsFlat({ prefix: destinationResourceId })) blobNames.push(name);
    return blobNames;
  };

  // Every clone is flattened into the copy's own files directory, so a working copy and a published snapshot of
  // One file would collide were the source id carried over. Both must survive as distinct blobs
  test("clones both a working and a published reference to the same file", async () => {
    expect.hasAssertions();

    const content = {
      html: `<img src="${getResourceAssetUrl(workingBlobName)}"><img src="${getResourceAssetUrl(publishedBlobName)}">`,
    };
    const clonedContent = await cloneContentAssets(createDatabase(true).db, userId, content, destinationDirectoryName);
    const clonedBlobNames = await getClonedBlobNames();

    expect(clonedBlobNames).toHaveLength(2);
    // Each source url is rewritten to its own clone, so neither reference is left pointing at the original.
    for (const clonedBlobName of clonedBlobNames)
      expect(clonedContent.html).toContain(getResourceAssetUrl(clonedBlobName));
    expect(clonedContent.html).not.toContain(getResourceAssetUrl(workingBlobName));
  });

  test("clones a published reference into the copy's working files directory", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(publishedBlobName)}">` };
    await cloneContentAssets(createDatabase(true).db, userId, content, destinationDirectoryName);
    const clonedBlobNames = await getClonedBlobNames();

    const prefix = `${destinationDirectoryName}/${FILES_DIRECTORY_SEGMENT}/`;
    const suffix = `${ID_SEPARATOR}${filename}`;
    const clonedBlobName = takeOne(clonedBlobNames);

    // Never under the copy's own published prefix — unpublishing wipes that directory.
    expect(clonedBlobNames).toHaveLength(1);
    expect(clonedBlobName.startsWith(prefix)).toBe(true);
    expect(clonedBlobName.endsWith(suffix)).toBe(true);
    // The id segment is freshly minted, so only its shape can be asserted.
    expect(clonedBlobName.slice(prefix.length, -suffix.length)).toMatch(/^[\da-f-]+$/u);
  });

  // Restore clones a snapshot back into the resource's own files directory, so a reused source id rebuilds the
  // Exact name a `deleteFile` of that asset already published for deletion
  test("never rebuilds the source name when cloning into the same resource", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(publishedBlobName)}">` };
    const clonedContent = await cloneContentAssets(createDatabase(true).db, userId, content, sourceResourceId);
    const clonedBlobNames: string[] = [];
    for await (const { name } of containerClient.listBlobsFlat({
      prefix: `${sourceResourceId}/${FILES_DIRECTORY_SEGMENT}/`,
    }))
      clonedBlobNames.push(name);

    expect(clonedBlobNames).toContain(workingBlobName);
    expect(clonedBlobNames).toHaveLength(2);
    expect(clonedContent.html).not.toContain(getResourceAssetUrl(workingBlobName));
  });

  // The copy path repeats the authorization the read path enforces: a working-copy url the caller cannot open
  // Reaches them easily, and copying it would republish someone else's private blob under a directory that
  // Answers to anyone
  test("carries a url the caller may not read verbatim instead of copying its blob", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(workingBlobName)}">` };
    const clonedContent = await cloneContentAssets(createDatabase(false).db, userId, content, destinationDirectoryName);
    const clonedBlobNames = await getClonedBlobNames();

    expect(clonedBlobNames).toHaveLength(0);
    expect(clonedContent.html).toContain(getResourceAssetUrl(workingBlobName));
  });

  // Readability is a property of the resource, and content routinely names one resource's assets many times
  // Over, so asking per url is a pair of queries each for an answer already computed
  test("asks the readability question once per source resource however many of its assets are referenced", async () => {
    expect.hasAssertions();

    await containerClient.getBlockBlobClient(siblingWorkingBlobName).upload(siblingWorkingBlobName, 1);
    const content = {
      html: `<img src="${getResourceAssetUrl(workingBlobName)}"><img src="${getResourceAssetUrl(siblingWorkingBlobName)}">`,
    };
    const { db, findFirstResource } = createDatabase(true);
    await cloneContentAssets(db, userId, content, destinationDirectoryName);
    const clonedBlobNames = await getClonedBlobNames();

    expect(clonedBlobNames).toHaveLength(2);
    expect(findFirstResource).toHaveBeenCalledTimes(1);
  });

  // Content routinely names both kinds of one resource's urls at once, and ownership answers both — so caching
  // Per url kind asked it twice for one resource
  test("asks the ownership question once for a resource named by both a working-copy and a published url", async () => {
    expect.hasAssertions();

    const content = {
      html: `<img src="${getResourceAssetUrl(workingBlobName)}"><img src="${getResourceAssetUrl(publishedBlobName)}">`,
    };
    const { db, findFirstResource } = createDatabase(true);
    await cloneContentAssets(db, userId, content, destinationDirectoryName);
    const clonedBlobNames = await getClonedBlobNames();

    expect(clonedBlobNames).toHaveLength(2);
    expect(findFirstResource).toHaveBeenCalledTimes(1);
  });

  // The published check falls through to ownership when the publication row is gone, so asking it with the caller
  // Would re-issue the query whose answer already sent us down this branch
  test("never re-asks ownership for a published url whose publication row is gone", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(publishedBlobName)}">` };
    const { db, findFirstResource } = createDatabase(false);
    const clonedContent = await cloneContentAssets(db, userId, content, destinationDirectoryName);
    const clonedBlobNames = await getClonedBlobNames();

    expect(clonedBlobNames).toHaveLength(0);
    expect(clonedContent.html).toContain(getResourceAssetUrl(publishedBlobName));
    expect(findFirstResource).toHaveBeenCalledTimes(1);
  });
});
