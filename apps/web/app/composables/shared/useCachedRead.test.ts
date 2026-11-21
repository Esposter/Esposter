// @vitest-environment nuxt
import { CacheTag } from "#src/models/cache/CacheTag";
import { useCacheStore } from "#src/store/cache";
import { noop } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(useCachedRead, () => {
  const key = "key";
  const otherKey = "otherKey";
  const result = "result";
  const createQuery = () => vi.fn<(cacheKey: string) => Promise<string>>(() => Promise.resolve(result));

  test("reads once across concurrent and repeat callers", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const onSuccess = vi.fn<(readResult: string, cacheKey: string) => void>();
    const { read } = useCachedRead(query, { onSuccess });
    await Promise.all([read(), read()]);
    await read();

    expect(query).toHaveBeenCalledExactlyOnceWith("");
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(result, "");
  });

  test("leaves the entry unloaded when the read fails", async () => {
    expect.hasAssertions();

    const query = vi.fn<(cacheKey: string) => Promise<string>>();
    const onError = vi.fn<(error: Error) => void>();
    const error = new Error(" ");
    query.mockRejectedValueOnce(error).mockResolvedValue(result);
    const { read } = useCachedRead(query, { onError, onSuccess: noop });
    await read();
    await read();

    expect(query).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
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

  test("re-reads immediately when the cache refetches on invalidation", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    const { read } = useCachedRead(query, { isRefetchOnInvalidate: true, onSuccess: noop, tags: [CacheTag.Resources] });
    await read();
    await invalidateTags([CacheTag.Resources]);
    const callCountAfterInvalidation = query.mock.calls.length;
    await read();

    expect(callCountAfterInvalidation).toBe(2);
    // The re-read re-cached the entry, so the next mount reads nothing
    expect(query).toHaveBeenCalledTimes(2);
  });

  test("re-reads a refetching cache that nothing has read yet", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const cacheStore = useCacheStore();
    const { invalidateTags } = cacheStore;
    useCachedRead(query, { isRefetchOnInvalidate: true, onSuccess: noop, tags: [CacheTag.Resources] });
    await invalidateTags([CacheTag.Resources]);

    expect(query).toHaveBeenCalledExactlyOnceWith("");
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

    expect(query).toHaveBeenCalledExactlyOnceWith("");
  });

  // What the threads drawer calls on open: the re-read re-caches, so the next mount still reads nothing
  test("re-reads unconditionally on refetch", async () => {
    expect.hasAssertions();

    const query = createQuery();
    const { read, refetch } = useCachedRead(query, { onSuccess: noop });
    await read();
    await refetch();
    await read();

    expect(query).toHaveBeenCalledTimes(2);
  });

  // A refetch supersedes the one before it for its key, so a slower earlier answer that lands last is dropped
  test("drops an earlier refetch's answer that lands after a newer refetch's", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(readResult: string, cacheKey: string) => void>();
    const { promise: earlierAnswer, resolve: answerEarlierRefetch } = Promise.withResolvers<string>();
    let readCount = 0;
    const { refetch } = useCachedRead(
      () => {
        readCount++;
        return readCount === 1 ? earlierAnswer : Promise.resolve("newer");
      },
      { onSuccess },
    );
    const earlierRefetch = refetch();
    await refetch();
    answerEarlierRefetch(result);
    await earlierRefetch;

    expect(onSuccess).toHaveBeenCalledExactlyOnceWith("newer", "");
  });

  // Each cache key is a target of its own, so a refetch of one key does not drop the answer of another
  test("keeps the answer of a refetch that another key's refetch does not supersede", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(readResult: string, cacheKey: string) => void>();
    const { promise: slowAnswer, resolve: answerSlowRefetch } = Promise.withResolvers<string>();
    const { refetch } = useCachedRead((cacheKey) => (cacheKey === key ? slowAnswer : Promise.resolve(result)), {
      onSuccess,
    });
    const slowRefetch = refetch(key);
    await refetch(otherKey);
    answerSlowRefetch(result);
    await slowRefetch;

    expect(onSuccess).toHaveBeenCalledTimes(2);
  });
});
