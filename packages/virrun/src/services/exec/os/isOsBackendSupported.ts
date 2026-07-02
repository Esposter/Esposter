import { isVirrunEnabled } from "@/services/configuration/isVirrunEnabled";
import { probeOsBackendSupported } from "@/services/exec/os/probeOsBackendSupported";
import { readCapabilityCache } from "@/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "@/services/exec/os/writeCapabilityCache";
import { VIRRUN_FORCE_PROBE_KEY } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
// Memoized — a host's bubblewrap capability can't change within a process, and the os bench reconstructs the
// Backend (and so re-probes) every iteration.
let isSupported: boolean | undefined;
// Three-tier so a fresh `virrun -- <cmd>` process (one per command) never re-pays the probe on a warm host: the
// In-process memo short-circuits repeat calls within a run (resolveBackend + createOsBackend both ask, and the bench
// Reconstructs the backend every iteration); the persisted cross-process cache (keyed by getHostFingerprint, so it
// Self-invalidates on a kernel change) reuses a prior process's verdict — the real win, since the probe is otherwise
// A bwrap overlay mount on Linux and three `wsl.exe` round-trips on win32; only a cold cache runs the actual probe,
// Then writes its verdict back. VIRRUN_FORCE_PROBE bypasses the persisted cache (not the in-process memo, which is
// Always sound) for a host whose capability changed with no kernel-release bump. A missing/corrupt/mismatched cache
// Reads as undefined and falls through to the probe, so the cache is self-healing.
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
  if (isSupported !== undefined) return isSupported;
  const key = getHostFingerprint();
  if (process.env[VIRRUN_FORCE_PROBE_KEY] === undefined) {
    const cached = readCapabilityCache(key);
    if (cached !== undefined) {
      isSupported = cached;
      return cached;
    }
  }
  isSupported = probeOsBackendSupported();
  writeCapabilityCache({ key, supported: isSupported });
  return isSupported;
};
