import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { flowchartEditorRouter } from "@@/server/trpc/routers/flowchartEditor";
import { beforeAll, describe, expect, test } from "vitest";

describe("flowchartEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["flowchartEditor"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(flowchartEditorRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const flowchartEditor = await caller.readFlowchartEditor();
    const { createdAt, id, updatedAt } = flowchartEditor;

    expect(flowchartEditor).toStrictEqual(new FlowchartEditor({ createdAt, id, updatedAt }));
  });

  test.todo("saves and reads", async () => {
    expect.hasAssertions();

    const flowchartEditor = new FlowchartEditor();
    await caller.saveFlowchartEditor(flowchartEditor);
    const readFlowchartEditor = await caller.readFlowchartEditor();

    expect(readFlowchartEditor).toStrictEqual(flowchartEditor);
  });
});
