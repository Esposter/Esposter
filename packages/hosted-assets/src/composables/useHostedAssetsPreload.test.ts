import type { HostedAssetPreloadSet } from "#src/models/HostedAssetPreloadSet";

import { useHostedAssetsPreload } from "#src/composables/useHostedAssetsPreload";
import { HostedAssetPreloadStatus } from "#src/models/HostedAssetPreloadStatus";
import { TEST_CHANGED_MODEL_URL, TEST_CHANGED_SHA256, TEST_MODEL_URL, TEST_ORIGIN } from "#src/services/constants.test";
import { listHeldHostedAssetUrls } from "#src/services/listHeldHostedAssetUrls";
import { createMockCache } from "@esposter/db-mock/cache";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useHostedAssetsPreload, () => {
  const modelUrl = TEST_MODEL_URL;
  const modelFile = { bytes: 5, path: "model.pmx", url: modelUrl };
  const set: HostedAssetPreloadSet = { files: [modelFile], scopePrefixes: [`${TEST_ORIGIN}/a/`] };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => Promise.resolve(new Response(null, { status: 404 }))),
    );
    // The failed file's error is logged by the composable, which this suite does not need to read
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("a failed download does not start the game", async () => {
    expect.hasAssertions();

    vi.stubGlobal("caches", { open: () => Promise.resolve(createMockCache()) });
    const onHeld = vi.fn<() => void>();
    const { preload, status } = useHostedAssetsPreload(() => Promise.resolve(set), onHeld);
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(HostedAssetPreloadStatus.Failed);
    expect(onHeld).not.toHaveBeenCalled();
  });

  test("downloads are shown on the loading bar as the share held, whole once every file is held", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    await cache.put(modelUrl, new Response(null));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const { downloadProgress, preload } = useHostedAssetsPreload(() => Promise.resolve(set), vi.fn<() => void>());

    expect(downloadProgress.value).toBe(0);

    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(downloadProgress.value).toBe(1);
  });

  test("a second visit downloads nothing", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    await cache.put(modelUrl, new Response(null));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const onHeld = vi.fn<() => void>();
    const { preload, status } = useHostedAssetsPreload(() => Promise.resolve(set), onHeld);
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(HostedAssetPreloadStatus.Ready);
    expect(onHeld).toHaveBeenCalledExactlyOnceWith();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("a stale object of one product is evicted and another product's object is kept", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    const staleUrl = TEST_CHANGED_MODEL_URL;
    const otherProductUrl = `${TEST_ORIGIN}/b/${TEST_CHANGED_SHA256}.png`;
    await cache.put(modelUrl, new Response(null));
    await cache.put(staleUrl, new Response(null));
    await cache.put(otherProductUrl, new Response(null));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const { preload } = useHostedAssetsPreload(() => Promise.resolve(set), vi.fn<() => void>());
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    await expect(listHeldHostedAssetUrls(cache)).resolves.toStrictEqual(new Set([modelUrl, otherProductUrl]));
  });

  test("an eviction that fails once every file is held leaves the set ready and calls onHeld once", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    const staleUrl = TEST_CHANGED_MODEL_URL;
    await cache.put(modelUrl, new Response(null));
    await cache.put(staleUrl, new Response(null));
    vi.spyOn(cache, "delete").mockRejectedValue(new Error(" "));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const onHeld = vi.fn<() => void>();
    const { preload, status } = useHostedAssetsPreload(() => Promise.resolve(set), onHeld);
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(HostedAssetPreloadStatus.Ready);
    expect(onHeld).toHaveBeenCalledExactlyOnceWith();
  });

  test("a failed preload deletes nothing", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    const staleUrl = TEST_CHANGED_MODEL_URL;
    await cache.put(staleUrl, new Response(null));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const { preload, status } = useHostedAssetsPreload(() => Promise.resolve(set), vi.fn<() => void>());
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(HostedAssetPreloadStatus.Failed);
    await expect(listHeldHostedAssetUrls(cache)).resolves.toStrictEqual(new Set([staleUrl]));
  });
});
