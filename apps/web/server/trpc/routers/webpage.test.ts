import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { createSurvey } from "#server/trpc/routers/createSurvey.test";
import { resourceRouter } from "#server/trpc/routers/resource";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { surveyRouter } from "#server/trpc/routers/survey";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createTestImageNode } from "#shared/services/pageBuilder/constants.test";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { AzureContainer, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockBlockBlobClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe("webpageRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(webpageRouter);
  let caller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  const name = "name";
  const hash = "a".repeat(64);

  beforeAll(() => {
    caller = getCaller();
    resourceCaller = createCallerFactory(resourceRouter)(getMockContext());
    surveyCaller = createCallerFactory(surveyRouter)(getMockContext());
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

  test("A published webpage is one HTML document", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new WebpageEditor(createTestTextDocument(1)),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.html).toMatchInlineSnapshot(
      `"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style></style></head><body><div class="text"><p>node 0</p></div></body></html>"`,
    );
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

  // The survey invite's survey is indexed as a link when the page saves, so the survey's own delete reads the page as its consumer
  test("Deleting a surveyed invite's survey names the webpage", async () => {
    expect.hasAssertions();

    const newSurvey = await createSurvey(surveyCaller, name, {
      model: JSON.stringify({ pages: [{ elements: [{ name, type: "rating" }] }] }),
    });
    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new WebpageEditor({
        content: [
          {
            props: { id: crypto.randomUUID(), label: name, surveyId: newSurvey.id },
            type: WebpageNodeType.SurveyInvite,
          },
        ],
      }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const consumers = await resourceCaller.readResourceConsumers({ ids: [newSurvey.id] });

    expect(consumers).toStrictEqual([{ id: newResource.id, name, type: ResourceType.Webpage }]);
  });
});
