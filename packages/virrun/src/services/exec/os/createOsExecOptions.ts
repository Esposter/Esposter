import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { ExecStdio } from "#src/models/exec/ExecStdio";

import { getOsCacheRoot } from "#src/services/exec/os/getOsCacheRoot";
import { createSharedPackageStoreOptions } from "#src/services/exec/store/createSharedPackageStoreOptions";
import { NODE_MODULES_BIN_DIRECTORY, VIRRUN_ENV_KEY, VIRRUN_ENV_VALUE } from "#src/services/exec/util/constants";
import { resolveCwd } from "#src/services/exec/util/resolveCwd";
import { WSL_PATH_DELIMITER } from "#src/services/exec/wsl/constants";
import { readWslLoginEnvironment } from "#src/services/exec/wsl/readWslLoginEnvironment";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The os backend's ExecOptions: bind the shared pnpm store writable, inject the VIRRUN presence signal, and re-enable
// Network (the os backend isolates the filesystem, not the registry — pnpm must reach it to install). On win32
// `wsl.exe --exec` skips the login + rc files, so a profile-bound version manager's node and pnpm are off PATH; inject
// The PATH a real WSL login shell sees so they resolve ("" injects nothing, leaving the default PATH).
//
// The sandbox mounts `/` read-only, so the node and pnpm the repo pins must already be installed in the distro: a
// Version manager that would download one on first use fails EROFS inside the sandbox rather than silently writing to
// The user's home. Installing the pin is the version manager's job, done once outside any run.
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
  const isWindows = process.platform === "win32";
  const wslLoginPath = isWindows ? readWslLoginEnvironment().path : "";
  // On win32 the os backend REQUIRES the login-shell capture to place a Linux node on PATH; the support probe already
  // Proved WSL is present, so an empty capture is a *failed* capture (a cold-WSL login shell overrunning
  // WSL_LOGIN_ENVIRONMENT_TIMEOUT_MS, or a blocking rc), not "no WSL". Proceeding would run the command under the
  // Windows-interop PATH, where `pnpm` resolves to a /mnt/c Windows shim and dies with a cryptic `node: not found`
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
    cwd,
    env: { ...(path ? { PATH: path } : {}), ...sharedPackageStoreOptions.env, [VIRRUN_ENV_KEY]: VIRRUN_ENV_VALUE },
    isNetworkEnabled: true,
    stdio,
  };
};
