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
import { afterEach, beforeAll, describe, expect, test } from "vitest";

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
    await mockContext.db.delete(resources);
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
