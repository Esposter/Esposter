import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { emailEditorRouter } from "@@/server/trpc/routers/emailEditor";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic blob-state matrix lives in webpageEditor.test.ts; here only the wiring.
describe("emailEditor", () => {
  let caller: DecorateRouterRecord<TRPCRouter["emailEditor"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(emailEditorRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const emailEditor = new EmailEditor();
    await caller.saveEmailEditor(emailEditor);
    const readEmailEditor = await caller.readEmailEditor();

    expect(readEmailEditor).toStrictEqual(emailEditor);
  });
});
