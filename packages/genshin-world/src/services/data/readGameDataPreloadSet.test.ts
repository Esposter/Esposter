import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameDataPreloadSet } from "#src/services/data/readGameDataPreloadSet";
import { getHostedAssetUrl } from "hosted-assets";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readGameDataPreloadSet, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("every object the lock names is preloaded under its hosted url", async () => {
    expect.hasAssertions();

    const gameDataBaseUrl = "https://hosted.test";
    vi.stubGlobal("window", { location: { href: gameDataBaseUrl } });
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() => Promise.resolve(Response.json({ avatars: [] }))),
    );

    const { files } = await readGameDataPreloadSet(gameDataBaseUrl);
    const urls = new Set(files.map(({ url }) => url));

    for (const object of [...Object.values(gameDataLock.objects), ...Object.values(gameDataLock.indexes)])
      expect(urls.has(getHostedAssetUrl(gameDataBaseUrl, object))).toBe(true);
  });
});
