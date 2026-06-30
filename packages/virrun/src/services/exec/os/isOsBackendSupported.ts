import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { getResult, withFinalizer } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// Memoized — a host's bubblewrap capability can't change within a process, and the os bench reconstructs the
// Backend (and so re-probes) every iteration.
let isSupported: boolean | undefined;
// Whether this host can actually SET UP the overlay sandbox — not merely whether bwrap is on PATH. A `command -v
// Bwrap` probe is insufficient: bubblewrap built without overlayfs support (some WSL2 builds), or a kernel with
// Unprivileged user namespaces disabled, has bwrap present yet rejects the overlay flags. So we run the real argv
// From buildBwrapArgs against a throwaway dir, keeping the predicate in lockstep with what the backend emits. The
// Probed command is `true` (engine-agnostic): toolchain reachability is an orthogonal axis handled by the captured
// WSL login PATH (readWslLoginPath), so probing a specific binary here would conflate the two and hardcode an engine.
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
