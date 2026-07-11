import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { clickerRouter } from "@@/server/trpc/routers/clicker";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic blob-state matrix lives in webpage.test.ts; here only the wiring.
describe("clicker", () => {
  let caller: DecorateRouterRecord<TRPCRouter["clicker"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(clickerRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const clicker = new Clicker();
    await caller.saveClicker(clicker);
    const readClicker = await caller.readClicker();

    expect(readClicker).toStrictEqual(clicker);
  });
});
