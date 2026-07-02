import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { readCapabilityCache } from "@/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "@/services/exec/os/writeCapabilityCache";
import { VIRRUN_FORCE_PROBE_KEY } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { getResult, withFinalizer } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// Memoized — a host's bubblewrap capability can't change within a process, and the os bench reconstructs the
// Backend (and so re-probes) every iteration.
let isSupported: boolean | undefined;
// Whether this host can actually SET UP the overlay sandbox — not merely whether bwrap is on PATH. A `command -v
// Bwrap` probe is insufficient: bubblewrap built without overlayfs support (some WSL2 builds), or a kernel with
// Unprivileged user namespaces disabled, has bwrap present yet rejects the overlay flags. So we run the real argv
// From buildBwrapArgs, and on Linux probe the ACTUAL working directory the backend will sandbox (process.cwd()) —
// Not a throwaway tmpdir. A tmpdir is tmpfs, which hides the one failure that matters most: when cwd is itself an
// Overlayfs mount (virrun's own suite runs inside the os-backend sandbox via `virrun -- vitest`, so an os test that
// Overlays the repo dir is overlayfs-on-overlayfs), the kernel rejects the mount with EINVAL ("Can't make overlay
// Mount ... userxattr: Invalid argument"). A tmpfs probe passes there and the backend then throws mid-run; probing
// The real cwd keeps the predicate honest and in lockstep with what the backend emits, so a nested/incapable host
// Degrades (resolveBackend) or refuses (createOsBackend) cleanly instead of crashing. `--tmp-overlay` writes nothing
// To cwd (the upper is a discarded tmpfs), so the probe is side-effect-free. The probed command is `true`
// (engine-agnostic): toolchain reachability is an orthogonal axis handled by the captured WSL login PATH
// (readWslLoginPath), so probing a specific binary here would conflate the two and hardcode an engine.
const probeOsBackendSupported = (): boolean => {
  switch (process.platform) {
    case "linux":
      return getResult(() => execFileSync("bwrap", buildBwrapArgs(["true"], process.cwd()), { stdio: "pipe" })).match(
        () => true,
        () => false,
      );
    case "win32":
      return getResult(() => execFileSync("wsl.exe", ["--exec", "mktemp", "-d"], { stdio: "pipe" }))
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
    default:
      return false;
  }
};
// Three-tier so a fresh `virrun -- <cmd>` process (one per command) never re-pays the probe on a warm host: the
// In-process memo short-circuits repeat calls within a run (resolveBackend + createOsBackend both ask, and the bench
// Reconstructs the backend every iteration); the persisted cross-process cache (keyed by getHostFingerprint, so it
// Self-invalidates on a kernel change) reuses a prior process's verdict — the real win, since the probe is otherwise
// A bwrap overlay mount on Linux and three `wsl.exe` round-trips on win32; only a cold cache runs the actual probe,
// Then writes its verdict back. VIRRUN_FORCE_PROBE bypasses the persisted cache (not the in-process memo, which is
// Always sound) for a host whose capability changed with no kernel-release bump. A missing/corrupt/mismatched cache
// Reads as undefined and falls through to the probe, so the cache is self-healing.
export const isOsBackendSupported = (): boolean => {
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
