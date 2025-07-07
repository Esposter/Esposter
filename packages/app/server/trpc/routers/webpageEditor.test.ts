import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { MockContainerClientMap } from "@@/server/composables/azure/useContainerClient.test";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("webpageEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["webpageEditor"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(webpageEditorRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(() => {
    MockContainerClientMap.clear();
  });

  test("reads", async () => {
    expect.hasAssertions();

    const webpageEditor = await caller.readWebpageEditor();
    const { createdAt, id, updatedAt } = webpageEditor;

    expect(webpageEditor).toStrictEqual(new WebpageEditor({ createdAt, id, updatedAt }));
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const webpageEditor = new WebpageEditor();
    await caller.saveWebpageEditor(webpageEditor);
    const readWebpageEditor = await caller.readWebpageEditor();

    expect(readWebpageEditor).toStrictEqual(webpageEditor);
  });
});
