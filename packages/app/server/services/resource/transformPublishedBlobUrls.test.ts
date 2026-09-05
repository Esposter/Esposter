import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { ContainerClient } from "@azure/storage-blob";
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import {
  FILES_DIRECTORY_SEGMENT,
  RESOURCE_ASSET_URL_REGEX,
  RESOURCE_ASSETS_URL_PREFIX,
} from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { transformPublishedBlobUrls } from "@@/server/services/resource/transformPublishedBlobUrls";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { containerClientMock } = vi.hoisted(() => ({
  containerClientMock: {} as { current: ContainerClient },
}));

vi.mock(import("@@/server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

// The context here is a stub answering the clone's readability questions, so the charge every clone makes is
// Asserted against a real database in the publish router test rather than faked into this one
vi.mock(import("@esposter/db"), async (importOriginal) => ({
  ...(await importOriginal()),
  chargeStorageLedgerEntry: () => Promise.resolve(),
}));

describe(transformPublishedBlobUrls, () => {
  const resourceId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const filename = "a";
  const workingBlobName = `${resourceId}/${FILES_DIRECTORY_SEGMENT}/${fileId}${ID_SEPARATOR}${filename}`;
  const content = { html: `<img src="${getResourceAssetUrl(workingBlobName)}">` };
  // The clone authorizes every url it follows, so the context has to answer that question: this owner owns the
  // Resource being published, and the foreign url below is a published one, which any caller may read while its
  // Publication row stands
  const ctx = {
    db: {
      query: {
        resourcePublications: { findFirst: () => Promise.resolve({ resourceId }) },
        resources: { findFirst: () => Promise.resolve({ id: resourceId }) },
        // The clone announces the owner's new total once it is done, and reads it from here to do so
        users: { findFirst: () => Promise.resolve(undefined) },
      },
    },
    getSessionPayload: { user: { id: crypto.randomUUID() } },
  } as unknown as AuthedContext;
  let containerClient: MockContainerClient;

  beforeEach(async () => {
    containerClient = new MockContainerClient("", "resource-assets");
    containerClientMock.current = containerClient as unknown as ContainerClient;
    await containerClient.getBlockBlobClient(workingBlobName).upload(workingBlobName, workingBlobName.length);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
  });

  const PUBLISHED_DIRECTORY_REGEX = new RegExp(`${resourceId}/${SnapshotChannel.Published}/[^/]+`, "u");
  const transform = async () => {
    const { html } = await transformPublishedBlobUrls(ctx, { id: resourceId } as Resource, content);
    return PUBLISHED_DIRECTORY_REGEX.exec(html)?.[0];
  };

  // The rewrite's own output is what the serving endpoint has to decode, so the directory this mints and the
  // Shape parseResourceAssetPath accepts are one decision — split them and every published asset 400s
  test("rewrites to urls the serving endpoint can parse", async () => {
    expect.hasAssertions();

    const { html } = await transformPublishedBlobUrls(ctx, { id: resourceId } as Resource, content);
    const publishedUrl = takeOne([...html.matchAll(RESOURCE_ASSET_URL_REGEX)])[0];

    expect(parseResourceAssetPath(publishedUrl.slice(`${RESOURCE_ASSETS_URL_PREFIX}/`.length))).toStrictEqual({
      blobName: expect.stringContaining(`${resourceId}/${SnapshotChannel.Published}/`),
      isPublished: true,
      resourceId,
    });
  });

  // A foreign published url names another resource's publication directory, which that resource's next unpublish
  // Wipes wholesale. Blueprint-deployed content carries exactly such urls
  test("clones a foreign published reference rather than carrying it verbatim", async () => {
    expect.hasAssertions();

    const foreignResourceId = crypto.randomUUID();
    const foreignBlobName = `${foreignResourceId}/${SnapshotChannel.Published}/${crypto.randomUUID()}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    await containerClient.getBlockBlobClient(foreignBlobName).upload(foreignBlobName, foreignBlobName.length);
    const foreignUrl = getResourceAssetUrl(foreignBlobName);

    const { html } = await transformPublishedBlobUrls(ctx, { id: resourceId } as Resource, {
      html: `<img src="${foreignUrl}">`,
    });

    expect(html).not.toContain(foreignUrl);
    expect(PUBLISHED_DIRECTORY_REGEX.exec(html)?.[0]).toBeDefined();
  });

  // The clone runs before the publish transaction claims a version, so a version-keyed destination could only be
  // Predicted — and two concurrent publishes predict the same one, then race a copy Azure rejects
  test("clones into a directory that no concurrent publish can name", async () => {
    expect.hasAssertions();

    const publishedDirectoryName = await transform();
    const secondPublishedDirectoryName = await transform();

    expect(publishedDirectoryName).toBeDefined();
    expect(secondPublishedDirectoryName).not.toBe(publishedDirectoryName);
  });
});
