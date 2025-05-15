import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { webpageEditorRouter } from "@@/server/trpc/routers/webpageEditor";
import { beforeAll, describe, expect, test } from "vitest";

describe("webpageEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["webpageEditor"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(webpageEditorRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const webpageEditor = await caller.readWebpageEditor();
    const { createdAt, id } = webpageEditor;

    expect(webpageEditor).toStrictEqual(new WebpageEditor({ createdAt, id, updatedAt: createdAt }));
  });

  test.todo("saves and reads", async () => {
    expect.hasAssertions();

    const webpageEditor = new WebpageEditor();
    await caller.saveWebpageEditor(webpageEditor);
    const readWebpageEditor = await caller.readWebpageEditor();

    expect(readWebpageEditor).toStrictEqual(webpageEditor);
  });
});
