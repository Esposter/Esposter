import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { ResourcePublicationInResource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { connectAgentKey } from "#server/services/mcp/connectAgentKey.test";
import { createCallerFactory } from "#server/trpc";
import { resourceDispatchRouter } from "#server/trpc/routers/resourceDispatch";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { sheetRouter } from "#server/trpc/routers/sheet";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { McpScope } from "#shared/models/auth/McpScope";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("resourceDispatchRouter", () => {
  const { getMockContext } = setupResourceSuite(resourceDispatchRouter);
  let mockContext: Context;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const webpageEditor = new WebpageEditor({ description: "a" });

  beforeAll(() => {
    mockContext = getMockContext();
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  const readPublication = (resourceId: string) =>
    mockContext.db.query.resourcePublicationsInResource.findFirst({ where: { resourceId: { eq: resourceId } } });

  afterEach(() => {
    MockContainerDatabase.clear();
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

  test("A type that does not publish is refused in words", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const sheetResource = await sheetCaller.createResource({ name });

    await expect(callAgentTool("resource_publishResource", { id: sheetResource.id })).rejects.toThrow(
      "does not publish",
    );
    expect(await readPublication(sheetResource.id)).toBeUndefined();
  });
});
