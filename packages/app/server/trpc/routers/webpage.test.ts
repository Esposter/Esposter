import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { ContainerSASPermissions } from "@azure/storage-blob";
import { AzureContainer, resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { getMockSasUrl, MOCK_BLOB_BASE_URL, MockContainerDatabase } from "azure-mock";
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

  test("clones referenced assets into the publish directory and re-signs their urls on every read", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const blobName = `${newResource.id}/files/${crypto.randomUUID()}/image.png`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    const blobUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}/${blobName}`;
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: `<img src="${blobUrl}">` }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const readPermissions = ContainerSASPermissions.from({ read: true });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content?.html).toBe(`<img src="${getMockSasUrl(blobUrl, readPermissions, "b")}">`);

    await caller.publishResource({ id: newResource.id });
    const clonedBlobName = `${newResource.id}/published/1/${blobName.slice(`${newResource.id}/`.length)}`;

    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(clonedBlobName)).toBe(true);

    const publishedContent = await caller.readPublishedResourceContent(newResource.id);
    const clonedBlobUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}/${clonedBlobName}`;

    expect(publishedContent.content.html).toBe(`<img src="${getMockSasUrl(clonedBlobUrl, readPermissions, "b")}">`);
  });
});
