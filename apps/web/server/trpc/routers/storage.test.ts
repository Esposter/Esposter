import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { trpcRouter } from "@@/server/trpc/routers";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { setupResourceSuite } from "@@/server/trpc/routers/setupResourceSuite.test";
import { StorageTier } from "@esposter/db-schema";
import { beforeAll, describe, expect, test } from "vitest";

describe("storageRouter", () => {
  const { getCaller } = setupResourceSuite(trpcRouter);
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  const name = "name";

  beforeAll(() => {
    caller = getCaller();
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
