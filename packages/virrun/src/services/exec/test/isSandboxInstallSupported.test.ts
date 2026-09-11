import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { createHomeCacheTemporaryDirectory } from "#src/services/exec/test/createHomeCacheTemporaryDirectory.test";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { buildWslLoginShellCommand } from "#src/services/exec/wsl/buildWslLoginShellCommand";
import { getResult } from "@esposter/shared";
import { rmSync } from "node:fs";
import { describe } from "vitest";

// A host that runs the sandbox may still mount $HOME read-only (e.g. the root `test:packages` sandbox), where
// Mkdtemp under .cache throws EROFS — so prove the cache home is writable too, else the test crashes in beforeAll
// Instead of skipping.
const checkIsCacheHomeWritable = (): boolean =>
  getResult(() => {
    const directory = createHomeCacheTemporaryDirectory();
    rmSync(directory, { force: true, recursive: true });
  }).match(
    () => true,
    () => false,
  );
// Gate for the heavy install/snapshot tests. The win32 toolchain probe goes through the login + interactive shell
// (buildWslLoginShellCommand) the backend captures its PATH from, not a bare `wsl.exe --exec sh -lc`: a profile-bound
// Node manager (fnm, nvm…) is off the non-interactive PATH, so a plain probe skips the suite even though the backend
// Can reach node. This keeps the gate in lockstep with what readWslLoginEnvironment injects.
export const isSandboxInstallSupported: boolean =
  checkIsOsBackendSupported() &&
  getResult(() =>
    process.platform === "win32"
      ? execFileHidden("wsl.exe", [
          "--exec",
          "sh",
          "-c",
          buildWslLoginShellCommand("command -v node && node --version && corepack --version"),
        ])
      : execFileHidden("sh", ["-lc", "command -v pnpm"]),
  ).match(
    () => true,
    () => false,
  ) &&
  checkIsCacheHomeWritable();

describe.todo("isSandboxInstallSupported");
