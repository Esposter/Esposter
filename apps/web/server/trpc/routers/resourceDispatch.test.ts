import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { ResourceFileSasEntity } from "#shared/models/resource/ResourceFileSasEntity";
import type { ResourcePublicationInResource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { connectAgentKey } from "#server/services/mcp/connectAgentKey.test";
import { createCallerFactory } from "#server/trpc";
import { resourceDispatchRouter } from "#server/trpc/routers/resourceDispatch";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { sheetRouter } from "#server/trpc/routers/sheet";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { McpScope } from "#shared/models/auth/McpScope";
import { MimeType } from "#shared/models/file/MimeType";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getExpectedWriteSasUrl } from "#shared/services/storage/getExpectedWriteSasUrl.test";
import { AzureContainer, WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { getBlobUrl, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe("resourceDispatchRouter", () => {
  const { getMockContext } = setupResourceSuite(resourceDispatchRouter);
  let mockContext: Context;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const hash = "a".repeat(64);
  const mimetype = MimeType.Png;
  const size = 1;
  const webpageEditor = new WebpageEditor({ description: "a" });

  beforeAll(() => {
    mockContext = getMockContext();
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
  });

  const readPublication = (resourceId: string) =>
    mockContext.db.query.resourcePublicationsInResource.findFirst({ where: { resourceId: { eq: resourceId } } });

  test("a type that does not publish is refused in words", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const sheetResource = await sheetCaller.createResource({ name });

    await expect(
      callAgentTool("resource_publishResource", { id: sheetResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Invalid operation: Update, name: Sheet, does not publish]`);
    await expect(readPublication(sheetResource.id)).resolves.toBeUndefined();
  });

  test("an agent publishes and unpublishes a resource of a publishing type", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const webpageResource = await webpageCaller.createResource({ name });
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    const publication = await callAgentTool<ResourcePublicationInResource>("resource_publishResource", {
      id: webpageResource.id,
    });
    const publishedAfterPublish = await readPublication(webpageResource.id);
    await callAgentTool("resource_unpublishResource", { id: webpageResource.id });
    const publishedAfterUnpublish = await readPublication(webpageResource.id);

    expect(publication.resourceId).toStrictEqual(webpageResource.id);
    expect(publishedAfterPublish).toBeDefined();
    expect(publishedAfterUnpublish).toBeUndefined();
  });

  test("an agent is given a write address for the file's hash, and the store holds nothing until the bytes are sent", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const webpageResource = await webpageCaller.createResource({ name });
    const sasEntities = await callAgentTool<ResourceFileSasEntity[]>("resource_generateUploadFileSasEntities", {
      files: [{ hash, mimetype, size }],
      id: webpageResource.id,
    });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${hash}`;
    const blobUrl = getBlobUrl(AzureContainer.ResourceAssets, blobName);

    expect(sasEntities).toStrictEqual([{ id: hash, isHeld: false, sasUrl: getExpectedWriteSasUrl(blobUrl) }]);
    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(blobName)).not.toBe(true);
  });

  test("an agent uploads a file before its address expires", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${hash}`;
    const requestUploadAddress = () =>
      callAgentTool<ResourceFileSasEntity[]>("resource_generateUploadFileSasEntities", {
        files: [{ hash, mimetype, size }],
        id: webpageResource.id,
      });

    const blobUrl = getBlobUrl(AzureContainer.ResourceAssets, blobName);

    await expect(requestUploadAddress()).resolves.toStrictEqual([
      { id: hash, isHeld: false, sasUrl: getExpectedWriteSasUrl(blobUrl) },
    ]);
    // The agent's shell sends the bytes inside the address's hour, and the blob lands under the file's hash
    vi.setSystemTime(WRITE_SAS_DURATION_MS / 2);
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));

    await expect(requestUploadAddress()).resolves.toStrictEqual([{ id: hash, isHeld: true, sasUrl: "" }]);
  });
});
