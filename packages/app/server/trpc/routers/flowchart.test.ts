import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { flowchartRouter } from "@@/server/trpc/routers/flowchart";
import { resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("flowchart", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["flowchart"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(flowchartRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Flowchart);

    const flowchartEditor = new FlowchartEditor();
    await caller.saveResourceContent({
      content: flowchartEditor,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(flowchartEditor)));
  });

  test("serves the published snapshot to the public view", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const flowchartEditor = new FlowchartEditor();
    await caller.saveResourceContent({
      content: flowchartEditor,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content).toStrictEqual(jsonDateParse(JSON.stringify(flowchartEditor)));
  });
});
