import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { AzureContainer, resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
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
    const blobName = `${newResource.id}/files/${crypto.randomUUID()}|image.png`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    const url = getResourceAssetUrl(blobName);
    await caller.saveResourceContent({
      content: new WebpageEditor({ html: `<img src="${url}">` }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    // The owner read returns content exactly as saved — a stable url never expires, so nothing rewrites it
    expect(content?.html).toBe(`<img src="${url}">`);

    await caller.publishResource({ id: newResource.id });
    const clonedBlobName = `${newResource.id}/published/1/${blobName.slice(`${newResource.id}/`.length)}`;

    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(clonedBlobName)).toBe(true);

    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.html).toBe(`<img src="${getResourceAssetUrl(clonedBlobName)}">`);
  });
});
