import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";

import { getOsCacheRoot } from "@/services/exec/os/getOsCacheRoot";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { readWslLoginPath } from "@/services/exec/wsl/readWslLoginPath";
// The os backend's ExecOptions: bind the shared pnpm store writable, inject the VIRRUN presence signal, and
// Re-enable network (the os backend isolates the filesystem, not the registry — pnpm must reach it to bootstrap).
// On win32 `wsl.exe --exec` skips the login + rc files, so a profile-bound node manager's node is off PATH; inject
// The PATH a real WSL login shell sees so node/corepack resolve ("" injects nothing, leaving the default PATH).
export const createOsExecOptions = (cwd: string, stdio: ExecStdio): ExecOptions => {
  const sharedPackageStoreOptions = createSharedPackageStoreOptions(cwd, getOsCacheRoot(cwd));
  const wslLoginPath = process.platform === "win32" ? readWslLoginPath() : "";
  return {
    ...sharedPackageStoreOptions,
    cwd,
    env: {
      ...(wslLoginPath === "" ? {} : { PATH: wslLoginPath }),
      ...sharedPackageStoreOptions.env,
      [VIRRUN_ENV_KEY]: "true",
    },
    isNetworkEnabled: true,
    stdio,
  };
};
