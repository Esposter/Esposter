import { ExecFileError } from "#src/models/exec/util/ExecFileError";
import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { buildBwrapArgs } from "#src/services/exec/bwrap/buildBwrapArgs";
import { PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { getResult, noop, withFinalizer } from "@esposter/shared";
// Runs one host-capability attempt and grades it. A completed attempt is a verdict either way; an attempt whose child
// Was KILLED is not — the only thing that kills one here is its own timeout, and a bound elapsing says nothing about
// Whether bwrap can mount an overlay. That case answers `undefined` ("not answered") rather than false, so the caller
// Degrades this run to native without persisting a stall as a capability fact for the cache's whole window
// (checkIsOsBackendSupported). Both failure shapes trace, since a run that silently went native is the symptom either way.
const readProbeVerdict = (probe: () => void): boolean | undefined =>
  getResult(probe).match(
    () => true,
    (error) => {
      const isKilled = error instanceof ExecFileError && Boolean(error.signal);
      writeVirrunDebug(
        `os capability probe ${isKilled ? "timed out — verdict not cached" : "failed"} — ${error.message}`,
      );
      return isKilled ? undefined : false;
    },
  );
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
// (readWslLoginEnvironment), so probing a specific binary here would conflate the two and hardcode an engine. This is the
// Raw host-capability probe: it does NOT account for nesting (checkIsOsBackendSupported layers the VIRRUN nesting guard,
// The in-process memo, and the persisted cache on top), so it is safe to reuse anywhere the un-cached truth is wanted.
// `undefined` is the third answer, and it means the probe never got one — see readProbeVerdict.
export const probeOsBackendSupported = (): boolean | undefined => {
  switch (process.platform) {
    case "linux":
      return readProbeVerdict(() => {
        execFileHidden("bwrap", buildBwrapArgs(["true"], process.cwd()), { timeout: PROBE_TIMEOUT_MS });
      });
    case "win32":
      // Only the FIRST round-trip may have to wake the distro, so only it takes execWsl's wider cold-boot bound; the
      // Two that follow run against a distro this probe just used, which puts them back on the probe tier where a
      // Fixed question belongs. Giving all three the wide bound would let one wedged WSL service stall the CLI for
      // Three times as long, on every process — and the timed-out verdict is deliberately not cached, so nothing
      // Would amortize it away.
      return readProbeVerdict(() => {
        const wslDir = execWsl(["--exec", "mktemp", "-d"]).trim();
        withFinalizer(
          () => execWsl(["--exec", "bwrap", ...buildBwrapArgs(["true"], wslDir)], { timeout: PROBE_TIMEOUT_MS }),
          () => {
            // The probe's own mktemp dir, and nothing else sweeps the guest's /tmp on our behalf — a failed
            // Removal leaks one directory per probe, which is only ever visible if it is said out loud
            getResult(() => execWsl(["--exec", "rm", "-rf", wslDir], { timeout: PROBE_TIMEOUT_MS })).match(
              noop,
              ({ message }) => {
                writeVirrunDebug(`os probe temp ${wslDir} not removed — ${message}`);
              },
            );
          },
        );
      });
    default:
      return false;
  }
};
