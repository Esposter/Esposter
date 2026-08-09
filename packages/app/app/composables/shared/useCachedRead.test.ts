// @vitest-environment nuxt
import { CacheTag } from "@/models/cache/CacheTag";
import { useCacheStore } from "@/store/cache";
import { noop } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useCachedRead, () => {
  const key = "key";
  const otherKey = "otherKey";
  const result = "result";
  const createQuery = () => vi.fn<(cacheKey: string) => Promise<string>>(() => Promise.resolve(result));

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The gate is the caching layer and isExclusive is the concurrency one: concurrent first callers join one
  // Request, and every caller after it landed issues nothing at all
  test("reads once across concurrent and repeat callers", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const onSuccess = vi.fn<(readResult: string, cacheKey: string) => void>();
    const { read } = useCachedRead(query, { onSuccess });
    await Promise.all([read(), read()]);
    await read();

    expect(query).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(result, "");
  });

  // Caching a failure as "loaded" would leave the surface empty for the whole session, with its Retry a no-op
  test("leaves the entry unloaded when the read fails", async () => {
    expect.hasAssertions();

    const query = vi.fn<(cacheKey: string) => Promise<string>>();
    const onError = vi.fn<(error: Error) => void>();
    query.mockRejectedValueOnce(new Error("error")).mockResolvedValue(result);
    const { read } = useCachedRead(query, { onError, onSuccess: noop });
    await read();
    await read();

    expect(query).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test("hands onSuccess the key the read was issued for", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(readResult: string, cacheKey: string) => void>();
    const { read } = useCachedRead(createQuery(), { onSuccess });
    await read(key);

    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(result, key);
  });

  // The keyed form is what threadFollow needs: one room's follow state loading says nothing about another's
  test("caches each key independently", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const { read } = useCachedRead(query, { onSuccess: noop });
    await read(key);
    await read(otherKey);
    await read(key);

    expect(query.mock.calls).toStrictEqual([[key], [otherKey]]);
  });

  test("re-reads on the next call once its tag is invalidated", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    const { read } = useCachedRead(query, { onSuccess: noop, tags: [CacheTag.Resources] });
    await read();
    await invalidateTags([CacheTag.Resources]);
    const callCountAfterInvalidation = query.mock.calls.length;
    await read();

    expect(callCountAfterInvalidation).toBe(1);
    expect(query).toHaveBeenCalledTimes(2);
  });

  // The per-cache declaration that replaces the eager-versus-lazy judgement every call site used to make
  test("re-reads immediately when the cache refetches on invalidation", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    const { read } = useCachedRead(query, {
      isRefetchOnInvalidate: true,
      onSuccess: noop,
      tags: [CacheTag.Resources],
    });
    await read();
    await invalidateTags([CacheTag.Resources]);
    const callCountAfterInvalidation = query.mock.calls.length;
    await read();

    expect(callCountAfterInvalidation).toBe(2);
    // The re-read re-cached the entry, so the next mount reads nothing
    expect(query).toHaveBeenCalledTimes(2);
  });

  // A session cache's single entry exists whether or not anything has read it, so the surface mounting after
  // The write finds the new set instead of being the thing that discovers it changed
  test("re-reads a refetching cache that nothing has read yet", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    useCachedRead(query, { isRefetchOnInvalidate: true, onSuccess: noop, tags: [CacheTag.Resources] });
    await invalidateTags([CacheTag.Resources]);

    expect(query).toHaveBeenCalledTimes(1);
  });

  test("leaves an untagged cache alone when tags are invalidated", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    const { read } = useCachedRead(query, { onSuccess: noop });
    await read();
    await invalidateTags([CacheTag.Recents, CacheTag.Resources]);
    await read();

    expect(query).toHaveBeenCalledTimes(1);
  });

  // What followThread calls: only the server can resolve the root entity the drawer lists, so the cache is
  // Re-read rather than mirrored — and the re-read re-caches, so the next mount still reads nothing
  test("re-reads unconditionally on refetch", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const { read, refetch } = useCachedRead(query, { onSuccess: noop });
    await read();
    await refetch();
    await read();

    expect(query).toHaveBeenCalledTimes(2);
  });
});
