import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { ExecStdio } from "#src/models/exec/ExecStdio";

import { getOsCacheRoot } from "#src/services/exec/os/getOsCacheRoot";
import { createSharedPackageStoreOptions } from "#src/services/exec/store/createSharedPackageStoreOptions";
import {
  COREPACK_HOME_KEY,
  NODE_MODULES_BIN_DIRECTORY,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_ENV_KEY,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "#src/services/exec/util/constants";
import { resolveCwd } from "#src/services/exec/util/resolveCwd";
import { WSL_PATH_DELIMITER } from "#src/services/exec/wsl/constants";
import { readWslLoginEnvironment } from "#src/services/exec/wsl/readWslLoginEnvironment";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";
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
// `packageManager` version whenever the host's own corepack cache doesn't already hold it — writing under
// `$HOME/.cache` and dying with EROFS. Pointing COREPACK_HOME at a bound, host-persisted directory makes that
// Bootstrap writable once and reused by every later run.
//
// The captured login PATH holds only the distro's own directories — getSandboxLoginPath drops the Windows drive
// Mounts WSL interop appends to every login shell — so nothing on it can resolve the repo's own binaries (`oxlint`,
// `vue-tsc`, any node_modules/.bin entry point). Name that directory outright, ahead of the login PATH. Only on win32
// (wslLoginPath is non-empty): native Linux overlays at cwd, so its inherited PATH already resolves the right binary.
//
// By the repo's LOGICAL path, never the ext4 mirror's. The mirror is the overlay's read-only lower and deliberately
// Excludes node_modules (resolveMirrorExcludes — the deps come from the snapshot instead), so
// `<mirror>/node_modules/.bin` is a directory that never exists, and a PATH led by it resolves nothing. The sandbox
// Mounts the assembled overlay at — and chdir's into — the repo's own /mnt/<drive> path (createWslBwrapArgs), which is
// The one place node_modules is on disk while the command runs.
export const createOsExecOptions = (cwd: string, stdio: ExecStdio): ExecOptions => {
  const osCacheRoot = getOsCacheRoot(cwd);
  const sharedPackageStoreOptions = createSharedPackageStoreOptions(cwd, osCacheRoot);
  const corepackHome = join(osCacheRoot, VIRRUN_STORE_DIRECTORY_NAME, VIRRUN_COREPACK_STORE_DIRECTORY_NAME);
  mkdirSync(corepackHome, { recursive: true });
  const isWindows = process.platform === "win32";
  const wslLoginPath = isWindows ? readWslLoginEnvironment().path : "";
  // On win32 the os backend REQUIRES the login-shell capture to place a Linux node on PATH; the support probe already
  // Proved WSL is present, so an empty capture is a *failed* capture (a cold-WSL login shell overrunning
  // WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS, or a blocking rc), not "no WSL". Proceeding would run the command under the
  // Windows-interop PATH, where `corepack` resolves to the /mnt/c fnm shim and dies with a cryptic `node: not found`
  // (exit 127). Fail loud so the cause reads as a timeout to retry, not a real toolchain error.
  if (isWindows && !wslLoginPath)
    throw new InvalidOperationError(
      Operation.Read,
      createOsExecOptions.name,
      "WSL login-shell environment capture returned empty (likely a cold-WSL timeout or a blocking shell profile); start WSL with `wsl.exe -- true` and rerun — a warm distro captures immediately",
    );
  const path = wslLoginPath
    ? `${readWslPath(resolveCwd(cwd))}/${NODE_MODULES_BIN_DIRECTORY}${WSL_PATH_DELIMITER}${wslLoginPath}`
    : "";
  return {
    ...sharedPackageStoreOptions,
    bindDirectories: [...(sharedPackageStoreOptions.bindDirectories ?? []), corepackHome],
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
