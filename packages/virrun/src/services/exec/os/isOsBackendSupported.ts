import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { getResult, withFinalizer } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Memoized: a host's bubblewrap capability cannot change within a process, and createOsBackend (so the
// Os bench, which reconstructs the backend every iteration) probes on every construction - re-spawning
// Bwrap each call would dominate the bench timing.
let isSupported: boolean | undefined;
// Whether this host can actually run the os backend - not merely whether bwrap is on PATH. The backend
// Always wraps commands in a RAM overlay (--overlay-src/--tmp-overlay), so a `command -v bwrap` probe is
// Insufficient: a bubblewrap built without overlayfs support (e.g. some WSL2 builds), or a kernel with
// Unprivileged user namespaces disabled, has bwrap present yet rejects those flags, so every exec would
// Throw at sandbox setup. We exercise the real argv from buildBwrapArgs against a throwaway dir so the
// Predicate stays in lockstep with what the backend emits; getResult turns bwrap's non-zero exit (and the
// Win32 absence of bwrap) into false rather than a throw, per the project's no-try/catch convention.
//
// The probed command is `true` - the cheapest thing every POSIX host has - because this predicate answers
// Exactly one question: can the host set up the overlay sandbox? Whether the *toolchain* (node, pnpm, …) is
// Reachable inside it is an orthogonal axis handled by the captured WSL login PATH (see readWslLoginPath), so
// Probing a specific binary here would both conflate the two and hardcode one engine. `true` keeps the probe
// Engine-agnostic and forward-compatible with a future configurable engine.
export const isOsBackendSupported = (): boolean => {
  if (isSupported !== undefined) return isSupported;
  else if (process.platform === "linux") {
    const dir = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
    isSupported = getResult(() =>
      withFinalizer(
        () => execFileSync("bwrap", buildBwrapArgs(["true"], dir), { stdio: "pipe" }),
        () => {
          rmSync(dir, { force: true, recursive: true });
        },
      ),
    ).match(
      () => true,
      () => false,
    );
  } else if (process.platform === "win32")
    isSupported = getResult(() => execFileSync("wsl.exe", ["--exec", "mktemp", "-d"], { stdio: "pipe" }))
      .map((stdout) => stdout.toString().trim())
      .andThen((wslDir) =>
        getResult(() =>
          withFinalizer(
            () =>
              execFileSync("wsl.exe", ["--exec", "bwrap", ...buildBwrapArgs(["true"], wslDir)], {
                stdio: "pipe",
              }),
            () => {
              getResult(() => execFileSync("wsl.exe", ["--exec", "rm", "-rf", wslDir], { stdio: "pipe" })).unwrapOr(
                undefined,
              );
            },
          ),
        ),
      )
      .match(
        () => true,
        () => false,
      );
  else isSupported = false;

  return isSupported;
};
