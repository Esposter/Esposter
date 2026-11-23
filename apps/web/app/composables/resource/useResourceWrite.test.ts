// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useResourceWrite } from "#src/composables/resource/useResourceWrite";
import { CacheTag } from "#src/models/cache/CacheTag";
import { getResourcePatchEntry } from "#src/services/resource/overlay/getResourcePatchEntry";
import { useCacheStore } from "#src/store/cache";
import { useNotificationStore } from "#src/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

// A callback that announces its call, so a test awaits the finalizer rather than polling for it
const createAnnouncer = () => {
  const { promise: isCalled, resolve: onCalled } = Promise.withResolvers<void>();
  const announce = vi.fn<() => Promise<void>>(() => {
    onCalled();
    return Promise.resolve();
  });
  return { announce, isCalled };
};

describe(useResourceWrite, () => {
  const resource = createResourceListItem();
  const entry = getResourcePatchEntry(resource.id, { name: resource.name });
  const errorMessage = "refused";

  // A kept write and a refused one both end in the finalizer, so the tag goes stale and the list re-reads either way
  test.each([
    ["kept", false],
    ["refused", true],
  ])("ends a %s write by invalidating the Resources tag and re-reading the list", async (_label, isRefused) => {
    expect.hasAssertions();

    const invalidation = createAnnouncer();
    const cacheStore = useCacheStore();
    const { registerCache } = cacheStore;
    registerCache([CacheTag.Resources], invalidation.announce);
    const refresh = createAnnouncer();
    const write = () =>
      isRefused ? Promise.reject(new Error(errorMessage)) : Promise.resolve({ arrivals: [], confirmed: [] });
    useResourceWrite(refresh.announce).writeOptimistic(write, { entry });

    await Promise.all([invalidation.isCalled, refresh.isCalled]);
    expect(invalidation.announce).toHaveBeenCalledExactlyOnceWith();
    expect(refresh.announce).toHaveBeenCalledExactlyOnceWith();
  });

  // The notice a write shows as it is sent is withdrawn when the write is refused, leaving the error it raised in its place
  test("withdraws the notice a refused write showed", async () => {
    expect.hasAssertions();

    const notificationStore = useNotificationStore();
    const { displayNotifications } = storeToRefs(notificationStore);
    const refresh = createAnnouncer();
    useResourceWrite(refresh.announce).writeOptimistic(() => Promise.reject(new Error(errorMessage)), {
      entry,
      notification: { severity: NotificationSeverity.Success, title: resource.name },
    });

    await refresh.isCalled;
    await flushPromises();
    expect(displayNotifications.value.map(({ severity }) => severity)).toStrictEqual([NotificationSeverity.Error]);
  });
});
