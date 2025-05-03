import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { emailEditorRouter } from "@@/server/trpc/routers/emailEditor";
import { beforeEach, describe, expect, test } from "vitest";

describe("emailEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["emailEditor"]>;

  beforeEach(() => {
    const createCaller = createCallerFactory(emailEditorRouter);
    const mockContext = createMockContext();
    caller = createCaller(mockContext);
  });

  test("read", async () => {
    expect.hasAssertions();

    const emailEditor = await caller.readEmailEditor();
    const { createdAt, id } = emailEditor;

    expect(emailEditor).toStrictEqual(new EmailEditor({ createdAt, id, updatedAt: createdAt }));
  });

  test.todo("save and read", async () => {
    expect.hasAssertions();

    const emailEditor = new EmailEditor();
    await caller.saveEmailEditor(emailEditor);
    const readEmailEditor = await caller.readEmailEditor();

    expect(readEmailEditor).toStrictEqual(emailEditor);
  });
});
