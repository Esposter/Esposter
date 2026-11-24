import type { HostedAssetPreloadSet } from "#src/models/HostedAssetPreloadSet";

import { TEST_MODEL_URL, TEST_ORIGIN } from "#src/services/constants.test";
import { preloadHostedAssets } from "#src/services/preloadHostedAssets";
import { readHostedAssetFile } from "#src/services/readHostedAssetFile";
import { createMockCache } from "@esposter/db-mock/cache";
import { noop } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(readHostedAssetFile, () => {
  const modelText = "model";
  const set: HostedAssetPreloadSet = {
    files: [{ bytes: modelText.length, path: "model.pmx", url: TEST_MODEL_URL }],
    scopePrefixes: [`${TEST_ORIGIN}/a/`],
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("a file read before the preload is held when the preload plans, so it is not fetched again", async () => {
    expect.hasAssertions();

    const cache = createMockCache();
    vi.stubGlobal("caches", { open: () => Promise.resolve(cache) });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(modelText));
    const onHeld = vi.fn<() => void>();
    await readHostedAssetFile(TEST_MODEL_URL);
    await preloadHostedAssets(set, noop, onHeld);

    expect(onHeld).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
