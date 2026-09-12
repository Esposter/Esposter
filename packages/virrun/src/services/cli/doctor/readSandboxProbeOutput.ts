import { readProbeOutput } from "#src/services/cli/doctor/readProbeOutput";
import { PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { execWsl } from "#src/services/exec/wsl/execWsl";
// Run a probe command where the os backend actually runs it — directly on Linux, or through `wsl.exe --exec` on
// Win32 — so every doctor probe reaches the same place the backend does. The win32 side goes through execWsl rather
// Than spawning wsl.exe here, so it inherits the cold-boot-tolerant WSL bound: reporting `not found on PATH` for a
// Tool that was only waiting on the distro to boot is the same wrong answer the capability probe used to cache.
export const readSandboxProbeOutput = (file: string, args: readonly string[]): string | undefined =>
  readProbeOutput(() =>
    process.platform === "win32"
      ? execWsl(["--exec", file, ...args])
      : execFileHidden(file, args, { timeout: PROBE_TIMEOUT_MS }),
  );
