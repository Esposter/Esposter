import { isVirrunEnabled } from "#src/services/configuration/isVirrunEnabled";
import { probeOsBackendSupported } from "#src/services/exec/os/probeOsBackendSupported";
import { readCapabilityCache } from "#src/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "#src/services/exec/os/writeCapabilityCache";
import { createProbeCache } from "#src/services/exec/util/createProbeCache";
// A false verdict is persisted too — a host without bubblewrap is a stable fact of the fingerprint, and re-probing
// It every process is exactly the cost the cache exists to skip. It is not stable on win32, where the verdict comes
// From a WSL command under a timeout, so the entry is age-bounded (readCapabilityCache) rather than kept forever.
// A missing/corrupt/mismatched/expired cache reads as undefined and falls through to the probe, so it self-heals.
const readIsOsBackendSupported = createProbeCache({
  probe: probeOsBackendSupported,
  readPersistedCache: readCapabilityCache,
  shouldPersist: () => true,
  writePersistedCache: writeCapabilityCache,
});

export const isOsBackendSupported = (): boolean => {
  // A run already nested inside a virrun sandbox (the injected VIRRUN signal is set) can never set up its OWN os
  // Overlay: the outer `--ro-bind / /` makes ~/.virrun read-only (persist/snapshot writes fail EROFS) and re-overlaying
  // The already-overlaid cwd is kernel-dependent (rejected outright on some builds — "userxattr: Invalid argument").
  // The persisted cache is keyed only by host fingerprint, not nesting depth, so a non-nested run's `true` verdict
  // Leaks in through the read-only bind and would otherwise pass this predicate. Short-circuit BEFORE the memo/cache so
  // We neither trust that stale true nor write a nested-only `false` back (which would then leak out to the next
  // Un-nested run under the same fingerprint). Mirrors resolveBackend's nesting degrade — the backend degrades to
  // Native and these os tests skip rather than crash mid-run.
  if (isVirrunEnabled(process.env)) return false;
  return readIsOsBackendSupported();
};
