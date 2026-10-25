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
import { AzureContainer } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

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
    MockContainerDatabase.clear();
  });

  const readPublication = (resourceId: string) =>
    mockContext.db.query.resourcePublicationsInResource.findFirst({ where: { resourceId: { eq: resourceId } } });

  test("A type that does not publish is refused in words", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const sheetResource = await sheetCaller.createResource({ name });

    await expect(callAgentTool("resource_publishResource", { id: sheetResource.id })).rejects.toThrow(
      "does not publish",
    );
    expect(await readPublication(sheetResource.id)).toBeUndefined();
  });

  test("An agent publishes and unpublishes a resource of a publishing type", async () => {
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

    expect(publication).toMatchObject({ resourceId: webpageResource.id });
    expect(publishedAfterPublish).toBeDefined();
    expect(publishedAfterUnpublish).toBeUndefined();
  });

  test("An agent uploads a file before its address expires", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const webpageResource = await webpageCaller.createResource({ name });
    const [{ sasUrl }] = await callAgentTool<ResourceFileSasEntity[]>("resource_generateUploadFileSasEntities", {
      files: [{ hash, mimetype, size }],
      id: webpageResource.id,
    });
    // The agent's own shell sends the bytes to the address, and the store keeps them under the name it signs
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${hash}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(size)]]));
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert.exists(container);

    expect(sasUrl).toContain(blobName);
    expect(container.has(blobName)).toBe(true);
  });
});
