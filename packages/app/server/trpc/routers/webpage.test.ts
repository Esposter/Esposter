import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { FILES_DIRECTORY_SEGMENT, PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createPublishedAssetsDirectoryName } from "@@/server/services/resource/createPublishedAssetsDirectoryName";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { AzureContainer, resources, ResourceType } from "@esposter/db-schema";
import { ID_SEPARATOR, jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

const { transformPublishedBlobUrlsMock } = vi.hoisted(() => ({
  transformPublishedBlobUrlsMock:
    vi.fn<typeof import("@@/server/services/resource/transformPublishedBlobUrls").transformPublishedBlobUrls>(),
}));

vi.mock(import("@@/server/services/resource/transformPublishedBlobUrls"), async (importOriginal) => {
  const { transformPublishedBlobUrls } = await importOriginal();
  transformPublishedBlobUrlsMock.mockImplementation(transformPublishedBlobUrls);
  return { transformPublishedBlobUrls: transformPublishedBlobUrlsMock };
});

// The generic resource-procedure matrix is covered once in createResourceProcedures.test.ts;
// Here only the router wiring: resource type + content schema round-trip.
describe("webpage", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(webpageRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    transformPublishedBlobUrlsMock.mockClear();
    await mockContext.db.delete(resources);
  });

  // The assets are cloned before the transaction opens, so an unpublish landing in between sweeps them and this
  // Publish's own upsert then re-creates the publication row — published, with every image 404ing. The version
  // Says so exactly: the sweep only follows a row delete, and a delete restarts the sequence at 1, so a claim
  // That is not the successor of what the attempt read is proof one landed and the snapshot must be rebuilt.
  test("rebuilds the snapshot when an unpublish sweeps the assets it cloned", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: "a" }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    transformPublishedBlobUrlsMock.mockClear();
    // Lands between this publish's clone and its transaction, which is the whole race
    transformPublishedBlobUrlsMock.mockImplementationOnce(async (_context, _resource, content) => {
      await caller.unpublishResource({ id: newResource.id });
      return content;
    });

    await caller.publishResource({ id: newResource.id });

    expect(transformPublishedBlobUrlsMock).toHaveBeenCalledTimes(2);
  });

  test("transforms once when nothing races the publish", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: "a" }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await caller.publishResource({ id: newResource.id });

    expect(transformPublishedBlobUrlsMock).toHaveBeenCalledTimes(1);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Webpage);

    // The captured standalone render is part of the round-trip so the schema provably preserves it
    const webpageEditor = new WebpageEditor({ css: "a", html: "a" });
    await caller.saveResourceContent({
      content: webpageEditor,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
  });

  test("clones referenced assets into the publish directory and rewrites their stable urls", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const blobName = `${getFilesDirectoryName(newResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}a`;
    const publishedBlobName = `${createPublishedAssetsDirectoryName(crypto.randomUUID())}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}a`;
    MockContainerDatabase.set(
      AzureContainer.ResourceAssets,
      new Map([
        [blobName, Buffer.alloc(1)],
        [publishedBlobName, Buffer.alloc(1)],
      ]),
    );
    const url = getResourceAssetUrl(blobName);
    const publishedUrl = getResourceAssetUrl(publishedBlobName);
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: `<img src="${url}"><img src="${publishedUrl}">` }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    // The owner read returns content exactly as saved — a stable url never expires, so nothing rewrites it
    expect(content?.html).toBe(`<img src="${url}"><img src="${publishedUrl}">`);

    await caller.publishResource({ id: newResource.id });
    // The clone directory is minted per publish attempt rather than keyed by the version the transaction is
    // About to claim, so the container is what names it
    const clonedBlobNames = [...(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.keys() ?? [])].filter(
      (publishedBlobPath) =>
        publishedBlobPath.startsWith(`${newResource.id}/${PUBLISHED_DIRECTORY_SEGMENT}/`) &&
        // Only the filename carries over — the clone is written under a freshly minted asset id
        publishedBlobPath.endsWith(`${ID_SEPARATOR}a`),
    );

    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    // Both references are cloned. A foreign published url names another resource's publication directory, which
    // That resource's next unpublish wipes wholesale — carried verbatim it would leave this snapshot's images
    // 404ing on an operation this owner never performed
    expect(clonedBlobNames).toHaveLength(2);
    for (const clonedBlobName of clonedBlobNames)
      expect(publishedContent.content.html).toContain(getResourceAssetUrl(clonedBlobName));
    expect(publishedContent.content.html).not.toContain(url);
    expect(publishedContent.content.html).not.toContain(publishedUrl);
  });
});
