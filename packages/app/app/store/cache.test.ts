// @vitest-environment nuxt
import { CacheTag } from "@/models/cache/CacheTag";
import { useCacheStore } from "@/store/cache";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useCacheStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("invalidates only the caches registered under the tag", async () => {
    expect.hasAssertions();

    const invalidateResources = vi.fn<() => void>();
    const invalidateRecents = vi.fn<() => void>();
    const cacheStore = useCacheStore();
    const { invalidateTags, registerCache } = cacheStore;
    registerCache([CacheTag.Resources], invalidateResources);
    registerCache([CacheTag.Recents], invalidateRecents);
    await invalidateTags([CacheTag.Resources]);

    expect(invalidateResources).toHaveBeenCalledExactlyOnceWith();
    expect(invalidateRecents).not.toHaveBeenCalled();
  });

  // A cache tagged with both is one cache — dropping it twice would have it issue two re-reads for one write
  test("invalidates a cache carrying two of the invalidated tags once", async () => {
    expect.hasAssertions();

    const invalidate = vi.fn<() => void>();
    const cacheStore = useCacheStore();
    const { invalidateTags, registerCache } = cacheStore;
    registerCache([CacheTag.Recents, CacheTag.Resources], invalidate);
    await invalidateTags([CacheTag.Recents, CacheTag.Resources]);

    expect(invalidate).toHaveBeenCalledExactlyOnceWith();
  });

  // The write that invalidated it resolves after its caches have caught up, so the surface that triggered the
  // Write never renders the pre-write set
  test("waits for an invalidation that re-reads before it resolves", async () => {
    expect.hasAssertions();

    const { promise, resolve }: PromiseWithResolvers<void> = Promise.withResolvers();
    const cacheStore = useCacheStore();
    const { invalidateTags, registerCache } = cacheStore;
    let isRefetchSettled = false;
    registerCache([CacheTag.Resources], async () => {
      await promise;
      isRefetchSettled = true;
    });
    const invalidation = invalidateTags([CacheTag.Resources]);
    await flushPromises();
    const isRefetchSettledWhileInFlight = isRefetchSettled;
    resolve();
    await invalidation;

    expect(isRefetchSettledWhileInFlight).toBe(false);
    expect(isRefetchSettled).toBe(true);
  });

  // The registry is app-scoped for this: a module-level map would hold registrations from a torn-down app,
  // Leaking between tests and, on the server, between one request and the next
  test("keeps registrations scoped to the Pinia instance they were made on", async () => {
    expect.hasAssertions();

    const invalidate = vi.fn<() => void>();
    const cacheStore = useCacheStore();
    const { registerCache } = cacheStore;
    registerCache([CacheTag.Resources], invalidate);
    setActivePinia(createPinia());
    const newCacheStore = useCacheStore();
    const { invalidateTags } = newCacheStore;
    await invalidateTags([CacheTag.Resources]);

    expect(invalidate).not.toHaveBeenCalled();
  });
});
