import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { useCharacterPackPreload } from "#src/composables/useCharacterPackPreload";
import { CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { createCharacterPackCacheStub } from "#src/services/character/createCharacterPackCacheStub.test";
import { getCharacterPackCacheUrl } from "#src/services/character/getCharacterPackCacheUrl";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";
import { HostedAssetPreloadStatus, listHeldHostedAssetUrls } from "hosted-assets";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/character/readCharacterPackIndex"), () => ({
  readCharacterPackIndex: vi.fn<typeof readCharacterPackIndex>(),
}));

describe(useCharacterPackPreload, () => {
  const gameDataBaseUrl = "http://a.test";
  const sha256 = "0".repeat(64);
  const index: CharacterPackIndex = {
    avatars: [{ avatarId: 1, files: [{ bytes: 5, path: CHARACTER_MODEL_PATH, sha256 }], name: "a" }],
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
    vi.stubGlobal("window", { location: { href: `${gameDataBaseUrl}/` } });
    vi.stubGlobal("caches", { open: () => Promise.resolve(createCharacterPackCacheStub()) });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => Promise.resolve(new Response(null, { status: 404 }))),
    );
    vi.mocked(readCharacterPackIndex).mockResolvedValue(index);
    // The failed file's error is logged by the composable, which this suite does not need to read
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("missing pack stops the loading and draws no capsule", async () => {
    expect.hasAssertions();

    const onHeld = vi.fn<() => void>();
    const { preload, status } = useCharacterPackPreload(gameDataBaseUrl, onHeld);
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(HostedAssetPreloadStatus.Failed);
    expect(onHeld).not.toHaveBeenCalled();
  });

  test("downloads are shown on the launch loading bar as the share held, whole once every pack is held", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(
      getCharacterPackCacheUrl(`${gameDataBaseUrl}/`, 1, CHARACTER_MODEL_PATH, sha256),
      new Response(null),
    );
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const { downloadProgress, preload } = useCharacterPackPreload(gameDataBaseUrl, vi.fn<() => void>());

    expect(downloadProgress.value).toBe(0);

    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(downloadProgress.value).toBe(1);
  });

  test("every pack already held is ready without a fetch", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(
      getCharacterPackCacheUrl(`${gameDataBaseUrl}/`, 1, CHARACTER_MODEL_PATH, sha256),
      new Response(null),
    );
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const onHeld = vi.fn<() => void>();
    const { preload, status } = useCharacterPackPreload(gameDataBaseUrl, onHeld);
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(HostedAssetPreloadStatus.Ready);
    expect(onHeld).toHaveBeenCalledExactlyOnceWith();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("a successful preload evicts the stale packs of its own scope and keeps another product's entries", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    const modelUrl = getCharacterPackCacheUrl(`${gameDataBaseUrl}/`, 1, CHARACTER_MODEL_PATH, sha256);
    const staleUrl = getCharacterPackCacheUrl(`${gameDataBaseUrl}/`, 2, CHARACTER_MODEL_PATH, "1".repeat(64));
    const otherProductUrl = `${gameDataBaseUrl}/dungeons/${"2".repeat(64)}.png`;
    await cache.put(modelUrl, new Response(null));
    await cache.put(staleUrl, new Response(null));
    await cache.put(otherProductUrl, new Response(null));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const { preload } = useCharacterPackPreload(gameDataBaseUrl, vi.fn<() => void>());
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    await expect(listHeldHostedAssetUrls(cache)).resolves.toStrictEqual(new Set([modelUrl, otherProductUrl]));
  });

  test("a failed preload evicts nothing", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    const staleUrl = getCharacterPackCacheUrl(`${gameDataBaseUrl}/`, 2, CHARACTER_MODEL_PATH, "1".repeat(64));
    await cache.put(staleUrl, new Response(null));
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const { preload, status } = useCharacterPackPreload(gameDataBaseUrl, vi.fn<() => void>());
    const run = preload();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(HostedAssetPreloadStatus.Failed);
    await expect(listHeldHostedAssetUrls(cache)).resolves.toStrictEqual(new Set([staleUrl]));
  });
});
