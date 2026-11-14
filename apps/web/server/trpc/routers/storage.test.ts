import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { getMockSession } from "#server/trpc/context.test";
import { trpcRouter } from "#server/trpc/routers";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { StorageTier, StorageTierQuotaMap } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("storageRouter", () => {
  const { getCaller } = setupResourceSuite(trpcRouter);
  let caller: DecorateRouterRecord<TRPCRouter["_def"]["procedures"]>;
  const name = "name";

  beforeAll(() => {
    caller = getCaller();
  });

  afterEach(() => {
    userObjectCalls.length = 0;
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

  test("sends the updated storage usage to the owner's object when resource content is saved", async () => {
    expect.hasAssertions();

    const newResource = await caller.webpage.createResource({ name });
    await caller.webpage.saveResourceContent({
      content: new WebpageEditor(),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const storageUsage = await caller.storage.readUsage();

    // The exact figure is the serialized size of an empty editor, which moves with that model rather than with
    // The metering under test — so what is asserted is that the usage moved off zero
    expect(storageUsage.bytesUsed).toBeGreaterThan(0);
    expect(userObjectCalls.filter(({ method }) => method === "updateUsage")).toStrictEqual([
      { args: [storageUsage], method: "updateUsage", userId: getMockSession().user.id },
    ]);
  });
});
