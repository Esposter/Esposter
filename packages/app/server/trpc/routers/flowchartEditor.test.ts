import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { flowchartEditorRouter } from "@@/server/trpc/routers/flowchartEditor";
import { beforeEach, describe, expect, test } from "vitest";

describe("flowchartEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["flowchartEditor"]>;

  beforeEach(() => {
    const createCaller = createCallerFactory(flowchartEditorRouter);
    const mockContext = createMockContext();
    caller = createCaller(mockContext);
  });

  test("read", async () => {
    expect.hasAssertions();

    const flowchartEditor = await caller.readFlowchartEditor();
    const { createdAt, id } = flowchartEditor;

    expect(flowchartEditor).toStrictEqual(new FlowchartEditor({ createdAt, id, updatedAt: createdAt }));
  });

  test.todo("save and read", async () => {
    expect.hasAssertions();

    const flowchartEditor = new FlowchartEditor();
    await caller.saveFlowchartEditor(flowchartEditor);
    const readFlowchartEditor = await caller.readFlowchartEditor();

    expect(readFlowchartEditor).toStrictEqual(flowchartEditor);
  });
});
