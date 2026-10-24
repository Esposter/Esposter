import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createTestImageNode } from "#shared/services/pageBuilder/constants.test";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { AzureContainer, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockBlockBlobClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe("webpageRouter", () => {
  const { getCaller } = setupResourceSuite(webpageRouter);
  let caller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const hash = "a".repeat(64);

  beforeAll(() => {
    caller = getCaller();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Stores an uploaded image under its hash, the way the upload's write target lands it
  const addAsset = (resourceId: string) => {
    const resourceAssets = MockContainerDatabase.get(AzureContainer.ResourceAssets) ?? new Map<string, Buffer>();
    resourceAssets.set(`${getFilesDirectoryName(resourceId)}/${hash}`, Buffer.alloc(1));
    MockContainerDatabase.set(AzureContainer.ResourceAssets, resourceAssets);
    return getResourceAssetUrl(`${getFilesDirectoryName(resourceId)}/${hash}`);
  };

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Webpage);

    // The page is part of the round-trip so the schema provably preserves it
    const webpageEditor = new WebpageEditor({ description: "a" });
    await caller.saveResourceContent({
      content: webpageEditor,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
  });

  test("publishing a document with images copies no assets", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const url = addAsset(newResource.id);
    await caller.saveResourceContent({
      content: new WebpageEditor({ content: [createTestImageNode(url)] }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const copyBlobSpy = vi.spyOn(MockBlockBlobClient.prototype, "beginCopyFromURL");

    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(copyBlobSpy).not.toHaveBeenCalled();
    expect(publishedContent.content.html).toContain(url);
  });

  // The working copy's image is the one the published page names, so unpublishing leaves the file for the owner's editor
  test("unpublishing keeps an image the working copy still uses", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const url = addAsset(newResource.id);
    await caller.saveResourceContent({
      content: new WebpageEditor({ content: [createTestImageNode(url)] }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });

    await caller.unpublishResource({ id: newResource.id });

    const assetBlobName = `${getFilesDirectoryName(newResource.id)}/${hash}`;

    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(assetBlobName)).toBe(true);
    expect(JSON.stringify(await caller.readResourceContent({ id: newResource.id }))).toContain(url);
  });
});
