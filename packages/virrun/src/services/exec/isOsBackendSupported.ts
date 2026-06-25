import { buildBwrapArgs } from "@/services/exec/buildBwrapArgs";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Memoized: a host's bubblewrap capability cannot change within a process, and createOsBackend (so the
// Os bench, which reconstructs the backend every iteration) probes on every construction — re-spawning
// Bwrap each call would dominate the bench timing.
let isSupported: boolean | undefined;
// Whether this host can actually run the os backend — not merely whether bwrap is on PATH. The backend
// Always wraps commands in a RAM overlay (--overlay-src/--tmp-overlay), so a `command -v bwrap` probe is
// Insufficient: a bubblewrap built without overlayfs support (e.g. some WSL2 builds), or a kernel with
// Unprivileged user namespaces disabled, has bwrap present yet rejects those flags, so every exec would
// Throw at sandbox setup. We exercise the real argv from buildBwrapArgs against a throwaway dir so the
// Predicate stays in lockstep with what the backend emits; getResult turns bwrap's non-zero exit (and the
// Win32 absence of bwrap) into false rather than a throw, per the project's no-try/catch convention.
export const isOsBackendSupported = (): boolean => {
  if (isSupported !== undefined) return isSupported;
  else if (process.platform !== "linux") {
    isSupported = false;
    return isSupported;
  }
  const dir = mkdtempSync(join(tmpdir(), "os-support-"));
  isSupported = getResult(() => execFileSync("bwrap", buildBwrapArgs("true", dir), { stdio: "pipe" })).match(
    () => true,
    () => false,
  );
  return isSupported;
};
