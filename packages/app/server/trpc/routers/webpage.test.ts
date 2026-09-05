import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Resource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { FILES_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createSnapshotAssetsDirectoryName } from "@@/server/services/resource/snapshot/createSnapshotAssetsDirectoryName";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { AzureContainer, resources, ResourceType } from "@esposter/db-schema";
import { ID_SEPARATOR, jsonDateParse } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

type TransformPublishedBlobUrls = (ctx: AuthedContext, resource: Resource, content: unknown) => Promise<unknown>;

const { transformPublishedBlobUrlsMock } = vi.hoisted(() => ({
  transformPublishedBlobUrlsMock: vi.fn<TransformPublishedBlobUrls>(),
}));

vi.mock(import("@@/server/services/resource/transformPublishedBlobUrls"), async (importOriginal) => {
  const original = await importOriginal();
  transformPublishedBlobUrlsMock.mockImplementation(original.transformPublishedBlobUrls);
  // The real export is generic in its content and a `Mock` cannot carry a type parameter, so the module seam is
  // Where the concrete signature is widened back to it
  return {
    transformPublishedBlobUrls: transformPublishedBlobUrlsMock as unknown as typeof original.transformPublishedBlobUrls,
  };
});

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

  // Which of them tripped the successor check is not knowable at the repair, so the cause it actually carries is
  // What surfaces. Naming a concurrent unpublish told an owner their assets were swept when nothing had been, and
  // Buried the actionable reason — a dataset deleted between the first transform and the repair, say
  test("surfaces the repair's own cause rather than asserting a concurrent unpublish", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: "a" }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    transformPublishedBlobUrlsMock.mockImplementationOnce(async (_context, _resource, content) => {
      await caller.publishResource({ id: newResource.id });
      return content;
    });
    // The repair's own transform, which is the one that rejects
    transformPublishedBlobUrlsMock.mockRejectedValueOnce(
      new TRPCError({ code: "NOT_FOUND", message: "Dataset not found" }),
    );

    await expect(caller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Dataset not found]`,
    );
  });

  // The same race against a FIRST publish, which reads no publication row at all: the successor is what is
  // Checked, so reading no row means expecting to claim 1 — anything else proves a publish landed in between
  test("rebuilds the snapshot when a publish races a first publish", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: "a" }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    transformPublishedBlobUrlsMock.mockImplementationOnce(async (_context, _resource, content) => {
      await caller.publishResource({ id: newResource.id });
      return content;
    });

    await caller.publishResource({ id: newResource.id });

    // The racing publish transforms once of its own, and the outer attempt transforms again to rebuild
    expect(transformPublishedBlobUrlsMock).toHaveBeenCalledTimes(3);
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
    // Owned by ANOTHER user and genuinely published, so the publication row is the only thing that makes its
    // Published url readable here: the clone only follows urls the caller could read, and ownership — which
    // Answers a url of their own either way — is what a same-caller fixture would have answered with instead
    const foreignSession = await mockSessionOnce(mockContext.db);
    const foreignResource = await caller.createResource({ name });
    replayMockSession(foreignSession);
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: "a" }),
      contentVersion: foreignResource.contentVersion,
      id: foreignResource.id,
    });
    replayMockSession(foreignSession);
    await caller.publishResource({ id: foreignResource.id });
    const publishedBlobName = `${createSnapshotAssetsDirectoryName(foreignResource.id, SnapshotChannel.Published)}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}a`;
    // Added to the container rather than replacing it — the publish above wrote its own snapshot blob, and
    // Discarding that leaves the fixture's publication with nothing behind it
    const resourceAssets = MockContainerDatabase.get(AzureContainer.ResourceAssets) ?? new Map<string, Buffer>();
    resourceAssets.set(blobName, Buffer.alloc(1));
    resourceAssets.set(publishedBlobName, Buffer.alloc(1));
    MockContainerDatabase.set(AzureContainer.ResourceAssets, resourceAssets);
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
        publishedBlobPath.startsWith(`${newResource.id}/${SnapshotChannel.Published}/`) &&
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
