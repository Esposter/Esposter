// @vitest-environment nuxt
import type { StorageUsage } from "#shared/models/storage/StorageUsage";

import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useStorageStore } from "@/store/storage";
import { StorageTier } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useStorageStore, () => {
  const server = setupMswTrpc();
  const storageUsage: StorageUsage = {
    bytesUsed: 0,
    quotaBytes: StorageTierQuotaMap[StorageTier.Free],
    tier: StorageTier.Free,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The meter is remounted on every navigation inside the explorer, because the layout it lives in is declared
  // Per page — so the number is read once and held here, rather than the bar blanking and re-reading per page
  test("reads the usage once for repeat and concurrent mounts", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => StorageUsage>(() => storageUsage);
    server.use(trpcMsw.storage.readUsage.query(handler));
    const storageStore = useStorageStore();
    const { readStorageUsage } = storageStore;
    await Promise.all([readStorageUsage(), readStorageUsage()]);
    await readStorageUsage();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(storageStore.storageUsage).toStrictEqual(storageUsage);
  });
});
