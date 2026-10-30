import type { CharacterPackIndex } from "#src/models/character/CharacterPackIndex";

import { useCharacterPackPreload } from "#src/composables/useCharacterPackPreload";
import { CharacterPackPreloadStatus } from "#src/models/character/CharacterPackPreloadStatus";
import { CHARACTER_MODEL_PATH } from "#src/services/character/constants";
import { createCharacterPackCacheStub } from "#src/services/character/createCharacterPackCacheStub.test";
import { getCharacterPackCacheUrl } from "#src/services/character/getCharacterPackCacheUrl";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/character/readCharacterPackIndex"), () => ({
  readCharacterPackIndex: vi.fn<typeof readCharacterPackIndex>(),
}));

describe(useCharacterPackPreload, () => {
  const gameDataBaseUrl = "http://a.test";
  const index: CharacterPackIndex = {
    avatars: [{ avatarId: 1, files: [{ bytes: 5, path: CHARACTER_MODEL_PATH, sha256: "0".repeat(64) }], name: "a" }],
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
    const { retry, status } = useCharacterPackPreload(gameDataBaseUrl, onHeld);
    const run = retry();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(CharacterPackPreloadStatus.Failed);
    expect(onHeld).not.toHaveBeenCalled();
  });

  test("every pack already held is ready without a fetch", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    await cache.put(
      getCharacterPackCacheUrl(`${gameDataBaseUrl}/`, 1, CHARACTER_MODEL_PATH, "0".repeat(64)),
      new Response(null),
    );
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });

    const onHeld = vi.fn<() => void>();
    const { retry, status } = useCharacterPackPreload(gameDataBaseUrl, onHeld);
    const run = retry();
    await vi.runAllTimersAsync();
    await run;

    expect(status.value).toBe(CharacterPackPreloadStatus.Ready);
    expect(onHeld).toHaveBeenCalledExactlyOnceWith();
    expect(fetch).not.toHaveBeenCalled();
  });
});
