import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";

import { getOsCacheRoot } from "@/services/exec/os/getOsCacheRoot";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { readWslLoginPath } from "@/services/exec/wsl/readWslLoginPath";
// The os backend's ExecOptions: bind the shared pnpm store writable, inject the vitest-style VIRRUN presence
// Signal, and re-enable network (`--unshare-all` drops it, but the os backend isolates the filesystem, not the
// Registry — pnpm must reach it to bootstrap). On win32 the WSL bridge runs `wsl.exe --exec`, which skips the
// Login + rc files, so a profile-bound node manager's node is off PATH; inject the PATH a real WSL login shell
// Sees so node/corepack resolve. "" (capture failed, or Linux host) injects nothing, leaving the default PATH.
// The single source of truth for os exec wiring — createVirrun, the acceptance tests, and the bench all build on
// It, so the real backend and any differential baseline stay byte-identical in how they reach the host caches.
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
