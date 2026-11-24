import { TEST_MODEL_URL } from "#src/services/constants.test";
import { storeHostedAssetFile } from "#src/services/storeHostedAssetFile";
import { createMockCache } from "@esposter/db-mock/cache";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(storeHostedAssetFile, () => {
  const modelText = "model";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a store asked for an object already in flight joins that store, so one fetch serves both", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    const response = Promise.withResolvers<Response>();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(response.promise);
    const onChunk = vi.fn<(byteLength: number) => void>();
    const first = storeHostedAssetFile(cache, TEST_MODEL_URL, noop);
    const joined = storeHostedAssetFile(cache, TEST_MODEL_URL, onChunk);
    response.resolve(new Response(modelText));
    const [firstBlob, joinedBlob] = await Promise.all([first, joined]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(joinedBlob).toBe(firstBlob);
    expect(onChunk).toHaveBeenCalledExactlyOnceWith(modelText.length);
  });

  test("a url the cache already holds is answered from it, so the store does not fetch it again", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    await cache.put(TEST_MODEL_URL, new Response(modelText));
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error(" "));
    const onChunk = vi.fn<(byteLength: number) => void>();
    await storeHostedAssetFile(cache, TEST_MODEL_URL, onChunk);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onChunk).toHaveBeenCalledExactlyOnceWith(modelText.length);
  });
});
