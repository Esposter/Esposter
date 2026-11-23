import type { HostedAssetPreloadSet } from "#src/models/HostedAssetPreloadSet";

import { useHostedAssetsPreload } from "#src/composables/useHostedAssetsPreload";
import { HostedAssetPreloadStatus } from "#src/models/HostedAssetPreloadStatus";
import { createHostedAssetCacheStub } from "#src/services/createHostedAssetCacheStub.test";
import { listHeldHostedAssetUrls } from "#src/services/listHeldHostedAssetUrls";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useHostedAssetsPreload, () => {
  const origin = "http://a.test";
  const sha256 = "0".repeat(64);
  const modelUrl = `${origin}/characterPacks/1/model.pmx?sha256=${sha256}`;
  const modelFile = { bytes: 5, path: "model.pmx", url: modelUrl };
  const set: HostedAssetPreloadSet = { files: [modelFile], scopePrefixes: [`${origin}/characterPacks/`] };

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

  test("a file the host cannot serve fails the preload without calling onHeld", async () => {
    expect.hasAssertions();

    vi.stubGlobal("caches", { open: () => Promise.resolve(createHostedAssetCacheStub()) });
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

    const cache = createHostedAssetCacheStub();
    await cache.put(modelUrl, new Response(null));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const { downloadProgress, preload } = useHostedAssetsPreload(() => Promise.resolve(set), vi.fn<() => void>());

    expect(downloadProgress.value).toBe(0);

    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(downloadProgress.value).toBe(1);
  });

  test("every file already held is ready without a fetch", async () => {
    expect.hasAssertions();

    const cache = createHostedAssetCacheStub();
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

  test("a successful preload evicts the stale entries of its own scope and keeps another product's", async () => {
    expect.hasAssertions();

    const cache = createHostedAssetCacheStub();
    const staleUrl = `${origin}/characterPacks/2/model.pmx?sha256=${"1".repeat(64)}`;
    const otherProductUrl = `${origin}/dungeons/${"2".repeat(64)}.png`;
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

    const cache = createHostedAssetCacheStub();
    const staleUrl = `${origin}/characterPacks/2/model.pmx?sha256=${"1".repeat(64)}`;
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

  test("a failed preload evicts nothing", async () => {
    expect.hasAssertions();

    const cache = createHostedAssetCacheStub();
    const staleUrl = `${origin}/characterPacks/2/model.pmx?sha256=${"1".repeat(64)}`;
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
