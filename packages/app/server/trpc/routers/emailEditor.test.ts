import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { MockContainerClientMap } from "@@/server/composables/azure/useContainerClient.test";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { emailEditorRouter } from "@@/server/trpc/routers/emailEditor";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("emailEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["emailEditor"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(emailEditorRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(() => {
    MockContainerClientMap.clear();
  });

  test("reads", async () => {
    expect.hasAssertions();

    const emailEditor = await caller.readEmailEditor();
    const { createdAt, id, updatedAt } = emailEditor;

    expect(emailEditor).toStrictEqual(new EmailEditor({ createdAt, id, updatedAt }));
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const emailEditor = new EmailEditor();
    await caller.saveEmailEditor(emailEditor);
    const readEmailEditor = await caller.readEmailEditor();

    expect(readEmailEditor).toStrictEqual(emailEditor);
  });
});
