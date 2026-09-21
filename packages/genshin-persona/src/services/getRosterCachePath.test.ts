import { ROSTER_CACHE_PREFIX, STATE_DIRECTORY } from "#src/services/constants";
import { getRosterCachePath } from "#src/services/getRosterCachePath";
import { basename } from "node:path";
import { describe, expect, test } from "vitest";

describe(getRosterCachePath, () => {
  const version = "1.0";

  // Serving one language's roster out of another's cache fails silently — every name simply reads in the language
  // Before it — so both keys being in the file name is what makes a change of either a miss
  test("keys the cache by the version and the language together", () => {
    expect.hasAssertions();

    expect(basename(getRosterCachePath(version, "Japanese"))).not.toBe(
      basename(getRosterCachePath(version, "English")),
    );
    expect(basename(getRosterCachePath("1.1", "English"))).not.toBe(basename(getRosterCachePath(version, "English")));
  });

  // The sweep that keeps one roster on a machine finds every other by this prefix, so a path outside the state
  // Directory or under another prefix would leave caches behind
  test("writes into the state directory under the prefix the sweep looks for", () => {
    expect.hasAssertions();

    const cachePath = getRosterCachePath(version, "English");

    expect(cachePath.startsWith(STATE_DIRECTORY)).toBe(true);
    expect(basename(cachePath).startsWith(ROSTER_CACHE_PREFIX)).toBe(true);
  });
});
