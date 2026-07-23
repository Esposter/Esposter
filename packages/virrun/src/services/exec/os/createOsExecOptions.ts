import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";

import { getOsCacheRoot } from "@/services/exec/os/getOsCacheRoot";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import {
  COREPACK_HOME_KEY,
  NODE_MODULES_BIN_DIRECTORY,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_ENV_KEY,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { readWslLoginEnvironment } from "@/services/exec/wsl/readWslLoginEnvironment";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
// The os backend's ExecOptions: bind the shared pnpm store and the corepack home writable, inject the VIRRUN presence
// Signal, and re-enable network (the os backend isolates the filesystem, not the registry — pnpm must reach it to
// Bootstrap). On win32 `wsl.exe --exec` skips the login + rc files, so a profile-bound node manager's node is off PATH;
// Inject the PATH a real WSL login shell sees so node/corepack resolve ("" injects nothing, leaving the default PATH).
//
// The corepack home belongs to every run, not just the capture install: the sandbox mounts `/` read-only, so a command
// That shells out to `pnpm` resolves the node manager's corepack shim, which downloads the repo's pinned
// `packageManager` version whenever the host's own corepack cache doesn't already hold it — writing under `$HOME/.cache`
// And dying with EROFS. Pointing COREPACK_HOME at a bound, host-persisted dir makes that bootstrap writable once and
// Reused by every later run.
//
// That login PATH also carries the host's `/mnt/c/<repo>/node_modules/.bin` (WSL Windows-interop appends the Windows
// PATH), whose binaries are the *win32* build. But the sandbox chdir's into the ext4 source mirror, not /mnt/c, so
// That entry is the raw host tree, not the overlaid one — a bare `tsgo`/`eslint`/`oxlint` would resolve the win32
// Binary and crash needing its `-linux-x64` sibling. Prepend the mirror's own node_modules/.bin (overlaid from the
// Snapshot lower = current platform) so the Linux binary wins. Only on win32 (wslLoginPath is non-empty): native Linux
// Overlays at cwd, so its PATH already resolves the correct binary and needs no prepend.
export const createOsExecOptions = (cwd: string, stdio: ExecStdio): ExecOptions => {
  const sharedPackageStoreOptions = createSharedPackageStoreOptions(cwd, getOsCacheRoot(cwd));
  const corepackHome = join(getOsCacheRoot(cwd), VIRRUN_STORE_DIRECTORY_NAME, VIRRUN_COREPACK_STORE_DIRECTORY_NAME);
  mkdirSync(corepackHome, { recursive: true });
  const wslLoginPath = process.platform === "win32" ? readWslLoginEnvironment().path : "";
  // On win32 the os backend REQUIRES the login-shell capture to place a Linux node on PATH; the support probe already
  // Proved WSL is present, so an empty capture is a *failed* capture (a cold-WSL login shell overrunning
  // WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS, or a blocking rc), not "no WSL". Proceeding would run the command under the
  // Windows-interop PATH, where `corepack` resolves to the /mnt/c fnm shim and dies with a cryptic `node: not found`
  // (exit 127). Fail loud so the cause reads as a timeout to retry, not a real toolchain error.
  if (process.platform === "win32" && !wslLoginPath)
    throw new InvalidOperationError(
      Operation.Read,
      createOsExecOptions.name,
      "WSL login-shell environment capture returned empty (likely a cold-WSL timeout or a blocking shell profile); rerun once WSL is warm, or raise WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS",
    );
  const path = wslLoginPath
    ? `${getWslSourceMirrorPath(resolveCwd(cwd))}/${NODE_MODULES_BIN_DIRECTORY}:${wslLoginPath}`
    : "";
  return {
    ...sharedPackageStoreOptions,
    bindDirs: [...(sharedPackageStoreOptions.bindDirs ?? []), corepackHome],
    cwd,
    env: {
      ...(path ? { PATH: path } : {}),
      ...sharedPackageStoreOptions.env,
      [COREPACK_HOME_KEY]: corepackHome,
      [VIRRUN_ENV_KEY]: "true",
    },
    isNetworkEnabled: true,
    stdio,
  };
};
