// @vitest-environment nuxt
import type { UserInAuth } from "@esposter/db-schema";

import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useStorageStore } from "#src/store/storage";
import { StorageTier, StorageTierQuotaMap } from "@esposter/db-schema";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: { user: { id: string } } | undefined;
}

describe(useStorageStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = v7();
  const storageUser: UserInAuth = {
    biography: "",
    createdAt: new Date(0),
    deletedAt: null,
    deletionRequestedAt: null,
    email: "email",
    emailVerified: false,
    id: userId,
    image: "",
    name: "name",
    storageBytesUsed: 0,
    storageTier: StorageTier.Free,
    updatedAt: new Date(0),
    version: 0,
  };
  const pushedStorageUser: UserInAuth = { ...storageUser, storageBytesUsed: 1, version: 1 };

  beforeEach(() => {
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
  });

  // The meter is remounted on every navigation inside the explorer, because the layout it lives in is declared
  // Per page — so the number is read once and held here, rather than the bar blanking and re-reading per page
  test("reads the usage once for repeat and concurrent mounts", async () => {
    expect.hasAssertions();

    const handler = vi.fn<() => UserInAuth>(() => storageUser);
    trpcMsw.storage.readUsage.query(handler);
    const storageStore = useStorageStore();
    const { storageUsage } = storeToRefs(storageStore);
    const { readStorageUsage } = storageStore;
    await Promise.all([readStorageUsage(), readStorageUsage()]);
    await readStorageUsage();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(storageUsage.value).toStrictEqual({
      bytesUsed: storageUser.storageBytesUsed,
      quotaBytes: StorageTierQuotaMap[StorageTier.Free],
      tier: StorageTier.Free,
    });
  });

  // The subscription is established before the first read is issued, so a charge can land between the two. The
  // Pushed total is the user row at its version, and a read answering with an older version loses to it, whatever order
  // The two answers arrive in
  test("applies a pushed total at its version, and an older row arriving after it does not replace it", async () => {
    expect.hasAssertions();

    trpcMsw.storage.readUsage.query(() => storageUser);
    const storageStore = useStorageStore();
    const { storageUsage } = storeToRefs(storageStore);
    const { readStorageUsage, storeUpdateStorageUsage } = storageStore;
    await readStorageUsage();
    storeUpdateStorageUsage(pushedStorageUser);
    storeUpdateStorageUsage(storageUser);

    expect(storageUsage.value).toStrictEqual({
      bytesUsed: pushedStorageUser.storageBytesUsed,
      quotaBytes: StorageTierQuotaMap[StorageTier.Free],
      tier: StorageTier.Free,
    });
  });

  test("keeps a pushed total that lands while the read is in flight over the read's older row", async () => {
    expect.hasAssertions();

    const readResult = Promise.withResolvers<UserInAuth>();
    trpcMsw.storage.readUsage.query(() => readResult.promise);
    const storageStore = useStorageStore();
    const { storageUsage } = storeToRefs(storageStore);
    const { readStorageUsage, storeUpdateStorageUsage } = storageStore;
    const readPromise = readStorageUsage();
    storeUpdateStorageUsage(pushedStorageUser);
    readResult.resolve(storageUser);
    await readPromise;

    expect(storageUsage.value).toStrictEqual({
      bytesUsed: pushedStorageUser.storageBytesUsed,
      quotaBytes: StorageTierQuotaMap[StorageTier.Free],
      tier: StorageTier.Free,
    });
  });
});
