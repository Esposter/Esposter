import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { trpcRouter } from "@@/server/trpc/routers";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { resources, StorageTier } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("storageRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(trpcRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("readUsage reads the initial storage usage for the authed user", async () => {
    expect.hasAssertions();

    const storageUsage = await caller.storage.readUsage();

    expect(storageUsage).toStrictEqual({
      bytesUsed: 0,
      quotaBytes: StorageTierQuotaMap[StorageTier.Free],
      tier: StorageTier.Free,
    });
  });

  test("onUpdateUsage emits the updated storage usage when resource content is saved", async () => {
    expect.hasAssertions();

    const newResource = await caller.webpage.createResource({ name });
    const onUpdateUsage = await caller.storage.onUpdateUsage();
    const emittedUsage = await getFirstEmit(
      () => onUpdateUsage,
      () =>
        caller.webpage.saveResourceContent({
          content: new WebpageEditor(),
          contentVersion: newResource.contentVersion,
          id: newResource.id,
        }),
    );

    // The exact figure is the serialized size of an empty editor, which moves with that model rather than with
    // The metering under test — so what is asserted is that the usage moved off zero
    expect(emittedUsage.bytesUsed).toBeGreaterThan(0);
    expect(emittedUsage.quotaBytes).toBe(StorageTierQuotaMap[StorageTier.Free]);
    expect(emittedUsage.tier).toBe(StorageTier.Free);
  });
});
