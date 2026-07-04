import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { flowchartEditorRouter } from "@@/server/trpc/routers/flowchartEditor";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic blob-state matrix lives in webpageEditor.test.ts; here only the wiring.
describe("flowchartEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["flowchartEditor"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(flowchartEditorRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const flowchartEditor = new FlowchartEditor();
    await caller.saveFlowchartEditor(flowchartEditor);
    const readFlowchartEditor = await caller.readFlowchartEditor();

    expect(readFlowchartEditor).toStrictEqual(flowchartEditor);
  });
});
