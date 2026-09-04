import { checkIsVirrunEnabled } from "#src/services/configuration/checkIsVirrunEnabled";
import { probeOsBackendSupported } from "#src/services/exec/os/probeOsBackendSupported";
import { readCapabilityCache } from "#src/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "#src/services/exec/os/writeCapabilityCache";
import { createProbeCache } from "#src/services/exec/util/createProbeCache";
// A false verdict is persisted too — a host without bubblewrap is a stable fact of the fingerprint, and re-probing
// It every process is exactly the cost the cache exists to skip. A verdict the probe never reached is not such a
// Fact: on win32 it comes from a WSL command under a timeout, and a distro that was merely cold answers nothing
// While the host sandboxes perfectly well. Caching that would degrade every run to native for the entry's whole
// Window, so it is answered as undefined and shouldPersist drops it, leaving the next process to re-probe against a
// Warm distro. The entry is age-bounded on top (readCapabilityCache) as the backstop, and a missing/corrupt/
// Mismatched/expired cache reads as undefined and falls through to the probe, so it self-heals.
const readOsBackendSupport = createProbeCache<boolean | undefined>({
  probe: probeOsBackendSupported,
  readPersistedCache: readCapabilityCache,
  shouldPersist: (value) => value !== undefined,
  // Only a verdict shouldPersist accepted ever reaches here, so `value === true` is that same non-undefined case
  // Read as the boolean the cache file holds — the narrowing the pair already guarantees, spelled without a cast.
  writePersistedCache: ({ key, value }) => {
    writeCapabilityCache({ key, value: value === true });
  },
});

export const checkIsOsBackendSupported = (): boolean => {
  // A run already nested inside a virrun sandbox (the injected VIRRUN signal is set) can never set up its OWN os
  // Overlay: the outer `--ro-bind / /` makes ~/.virrun read-only (persist/snapshot writes fail EROFS) and re-overlaying
  // The already-overlaid cwd is kernel-dependent (rejected outright on some builds — "userxattr: Invalid argument").
  // The persisted cache is keyed only by host fingerprint, not nesting depth, so a non-nested run's `true` verdict
  // Leaks in through the read-only bind and would otherwise pass this predicate. Short-circuit BEFORE the memo/cache so
  // We neither trust that stale true nor write a nested-only `false` back (which would then leak out to the next
  // Un-nested run under the same fingerprint). Mirrors resolveBackend's nesting degrade — the backend degrades to
  // Native and these os tests skip rather than crash mid-run.
  if (checkIsVirrunEnabled(process.env)) return false;
  return readOsBackendSupport() ?? false;
};
