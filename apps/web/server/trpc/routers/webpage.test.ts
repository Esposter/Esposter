import type { TRPCRouter } from "#server/trpc/routers";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { trpcRouter } from "#server/trpc/routers";
import { createSurvey, createSurveyDocumentWith } from "#server/trpc/routers/createSurvey.test";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { surveyRouter } from "#server/trpc/routers/survey";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createTestImageNode } from "#shared/services/pageBuilder/constants.test";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket, getResourceFileBlobName, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { SurveyNodeType } from "vue-survey-engine-headless";

const { buckets } = vi.hoisted(() => ({ buckets: {} as Record<StorageBucket, R2Bucket> }));

vi.mock(import("#server/services/storage/getBucket"), () => ({
  getBucket: (storageBucket: StorageBucket) => buckets[storageBucket],
}));

describe("webpageRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(webpageRouter);
  let caller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let surveyCaller: DecorateRouterRecord<TRPCRouter["survey"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;
  const name = "name";
  const hash = "a".repeat(64);

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
    buckets[StorageBucket.ResourceAssets] = bucket;
    caller = getCaller();
    resourceCaller = createCallerFactory(trpcRouter)(getMockContext()).resource;
    surveyCaller = createCallerFactory(surveyRouter)(getMockContext());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await dispose();
  });

  // Stores an uploaded image under its hash, the way the upload's write target lands it
  const addAsset = async (resourceId: string) => {
    const blobName = getResourceFileBlobName(resourceId, hash);
    await bucket.put(blobName, Buffer.alloc(1));
    return getResourceAssetUrl(blobName);
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

  test("a published webpage is one HTML document", async () => {
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

  test("publishing a document with images keeps each image's url", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const url = await addAsset(newResource.id);
    await caller.saveResourceContent({
      content: new WebpageEditor({ content: [createTestImageNode(url)] }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.html).toBe(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>.image { max-width: 100%; height: auto; }</style></head><body><img alt="" class="image" role="presentation" src="${url}"></body></html>`,
    );
  });

  // The working copy's image is the one the published page names, so unpublishing leaves the file for the owner's editor
  test("unpublishing keeps an image the working copy still uses", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const url = await addAsset(newResource.id);
    const webpageEditor = new WebpageEditor({ content: [createTestImageNode(url)] });
    await caller.saveResourceContent({
      content: webpageEditor,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });

    await caller.unpublishResource({ id: newResource.id });

    const assetBlobName = getResourceFileBlobName(newResource.id, hash);
    const content = await caller.readResourceContent({ id: newResource.id });

    await expect(bucket.head(assetBlobName)).resolves.not.toBeNull();
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
  });

  // The survey invite's survey is indexed as a link when the page saves, so the survey's own delete reads the page as its consumer
  test("deleting a surveyed invite's survey names the webpage", async () => {
    expect.hasAssertions();

    const newSurvey = await createSurvey(surveyCaller, name, {
      document: createSurveyDocumentWith([{ name, type: SurveyNodeType.Rating }]),
      settings: {},
    });
    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new WebpageEditor({
        content: [{ props: { id: v7(), label: name, surveyId: newSurvey.id }, type: WebpageNodeType.SurveyInvite }],
      }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const consumers = await resourceCaller.readResourceConsumers({ ids: [newSurvey.id] });

    expect(consumers).toStrictEqual([{ id: newResource.id, name, type: ResourceType.Webpage }]);
  });
});
