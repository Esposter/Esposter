import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { HOME_CACHE_DIRECTORY_NAME, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { buildWslLoginShellCommand } from "@/services/exec/wsl/buildWslLoginShellCommand";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";

// A host that runs the sandbox may still mount $HOME read-only (e.g. the root `test:packages` sandbox), where
// Mkdtemp under .cache throws EROFS — so prove the cache home is writable too, else the test crashes in beforeAll
// Instead of skipping.
const isCacheHomeWritable = (): boolean =>
  getResult(() => {
    const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
    mkdirSync(cache, { recursive: true });
    const dir = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
    rmSync(dir, { force: true, recursive: true });
  }).match(
    () => true,
    () => false,
  );
// Gate for the heavy install/snapshot tests. The win32 toolchain probe goes through the login + interactive shell
// (buildWslLoginShellCommand) the backend captures its PATH from, not a bare `wsl.exe --exec sh -lc`: a profile-bound
// Node manager (fnm, nvm…) is off the non-interactive PATH, so a plain probe skips the suite even though the backend
// Can reach node. This keeps the gate in lockstep with what readWslLoginPath injects.
export const isSandboxInstallSupported: boolean =
  isOsBackendSupported() &&
  getResult(() =>
    process.platform === "win32"
      ? execFileSync(
          "wsl.exe",
          ["--exec", "sh", "-c", buildWslLoginShellCommand("command -v node && node --version && corepack --version")],
          { stdio: "pipe" },
        )
      : execFileSync("sh", ["-lc", "command -v pnpm"], { stdio: "pipe" }),
  ).match(
    () => true,
    () => false,
  ) &&
  isCacheHomeWritable();

describe.todo("isSandboxInstallSupported");
