import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { PROBE_TIMEOUT_MS } from "@/services/exec/util/constants";
import { getResult, withFinalizer } from "@esposter/shared";
import { execFileSync } from "node:child_process";
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
// (readWslLoginPath), so probing a specific binary here would conflate the two and hardcode an engine. This is the
// Raw host-capability probe: it does NOT account for nesting (isOsBackendSupported layers the VIRRUN nesting guard,
// The in-process memo, and the persisted cache on top), so it is safe to reuse anywhere the un-cached truth is wanted.
export const probeOsBackendSupported = (): boolean => {
  switch (process.platform) {
    case "linux":
      return getResult(() =>
        execFileSync("bwrap", buildBwrapArgs(["true"], process.cwd()), { stdio: "pipe", timeout: PROBE_TIMEOUT_MS }),
      ).match(
        () => true,
        () => false,
      );
    case "win32":
      return getResult(() =>
        execFileSync("wsl.exe", ["--exec", "mktemp", "-d"], { stdio: "pipe", timeout: PROBE_TIMEOUT_MS }),
      )
        .map((stdout) => stdout.toString().trim())
        .andThen((wslDir) =>
          getResult(() =>
            withFinalizer(
              () =>
                execFileSync("wsl.exe", ["--exec", "bwrap", ...buildBwrapArgs(["true"], wslDir)], {
                  stdio: "pipe",
                  timeout: PROBE_TIMEOUT_MS,
                }),
              () => {
                getResult(() =>
                  execFileSync("wsl.exe", ["--exec", "rm", "-rf", wslDir], {
                    stdio: "pipe",
                    timeout: PROBE_TIMEOUT_MS,
                  }),
                ).unwrapOr(undefined);
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
