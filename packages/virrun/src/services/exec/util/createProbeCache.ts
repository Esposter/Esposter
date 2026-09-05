import type { KeyedCache } from "#src/models/exec/KeyedCache";

import { VIRRUN_FORCE_PROBE_KEY } from "#src/services/exec/util/constants";
import { getHostFingerprint } from "#src/services/exec/util/getHostFingerprint";
// The three-tier control flow every host probe shares, so the caching contract lives in exactly one place: the
// In-process memo short-circuits repeat calls within a run; the persisted cross-process cache (getHostFingerprint-
// Keyed so it self-invalidates on a kernel change; VIRRUN_FORCE_PROBE bypasses it but never the memo, which is
// Always sound) reuses a prior process's verdict; only a cold cache runs the probe, then persists the values
// The `shouldPersist` predicate selects — a probe that degrades on transient failure passes a non-degraded one so the failure
// Re-probes next process instead of caching the miss. A probe that throws leaves both tiers unset, so the next call
// Re-probes. Everything probe-specific — filename, value schema, age bound, which side the cache is stored on —
// Stays with each probe via readPersistedCache/writePersistedCache; only the tier ordering lives here.
export const createProbeCache = <TValue>({
  probe,
  readPersistedCache,
  shouldPersist,
  writePersistedCache,
}: {
  probe: () => TValue;
  readPersistedCache: (key: string) => TValue | undefined;
  shouldPersist: (value: TValue) => boolean;
  writePersistedCache: (cache: Pick<KeyedCache<TValue>, "key" | "value">) => void;
}): (() => TValue) => {
  let cachedValue: TValue;
  let isCached = false;
  return () => {
    if (isCached) return cachedValue;
    const key = getHostFingerprint();
    if (process.env[VIRRUN_FORCE_PROBE_KEY] === undefined) {
      const cached = readPersistedCache(key);
      if (cached !== undefined) {
        cachedValue = cached;
        isCached = true;
        return cached;
      }
    }
    cachedValue = probe();
    isCached = true;
    if (shouldPersist(cachedValue)) writePersistedCache({ key, value: cachedValue });
    return cachedValue;
  };
};
