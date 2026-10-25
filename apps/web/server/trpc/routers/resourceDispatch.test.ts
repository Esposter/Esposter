import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { connectAgentKey } from "#server/services/mcp/connectAgentKey.test";
import { createCallerFactory } from "#server/trpc";
import { resourceDispatchRouter } from "#server/trpc/routers/resourceDispatch";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { sheetRouter } from "#server/trpc/routers/sheet";
import { McpScope } from "#shared/models/auth/McpScope";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("resourceDispatchRouter", () => {
  const { getMockContext } = setupResourceSuite(resourceDispatchRouter);
  let mockContext: Context;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  const name = "name";

  beforeAll(() => {
    mockContext = getMockContext();
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("A type that does not publish is refused in words", async () => {
    expect.hasAssertions();

    const callAgentTool = await connectAgentKey(mockContext, [McpScope.Resources]);
    const sheetResource = await sheetCaller.createResource({ name });

    await expect(callAgentTool("resource_publishResource", { id: sheetResource.id })).rejects.toThrow(
      "does not publish",
    );
    expect(
      await mockContext.db.query.resourcePublicationsInResource.findFirst({
        where: { resourceId: { eq: sheetResource.id } },
      }),
    ).toBeUndefined();
  });
});
