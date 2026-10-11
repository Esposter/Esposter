import type { PackageLookup } from "#src/models/outdatedDependencies/shared/PackageLookup";
import type { SupersessionCacheEntry } from "#src/models/outdatedDependencies/shared/SupersessionCacheEntry";

import { partitionCachedLookups } from "#src/services/outdatedDependencies/supersession/partitionCachedLookups";
import { describe, expect, test } from "vitest";

describe(partitionCachedLookups, () => {
  const now = Temporal.Instant.fromEpochMilliseconds(0);
  const verdict = { isArchived: true, renamedTo: "", repository: "codemirror/lang-vue", successor: "" };
  const freshLookup: PackageLookup = { cacheKey: "@codemirror/lang-vue@6.0.0", packageName: "@codemirror/lang-vue" };
  const staleLookup: PackageLookup = { cacheKey: "superjson@2.0.0", packageName: "superjson" };
  const missingLookup: PackageLookup = { cacheKey: "vue@3.0.0", packageName: "vue" };

  test("keeps a fresh read and asks again for a stale one and a missing one", () => {
    expect.hasAssertions();

    const cache: Record<string, SupersessionCacheEntry> = {
      [freshLookup.cacheKey]: { readAt: now.subtract({ hours: 24 * 6 }).toString(), verdict },
      [staleLookup.cacheKey]: { readAt: now.subtract({ hours: 24 * 8 }).toString(), verdict },
    };

    expect(partitionCachedLookups([freshLookup, staleLookup, missingLookup], cache, now)).toStrictEqual({
      cached: new Map([[freshLookup, cache[freshLookup.cacheKey]]]),
      uncached: [staleLookup, missingLookup],
    });
  });
});
