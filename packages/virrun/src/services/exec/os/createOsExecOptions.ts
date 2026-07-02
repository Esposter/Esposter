import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";

import { getOsCacheRoot } from "@/services/exec/os/getOsCacheRoot";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { NODE_MODULES_BIN_DIRECTORY, VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { readWslLoginPath } from "@/services/exec/wsl/readWslLoginPath";
// The os backend's ExecOptions: bind the shared pnpm store writable, inject the VIRRUN presence signal, and
// Re-enable network (the os backend isolates the filesystem, not the registry — pnpm must reach it to bootstrap).
// On win32 `wsl.exe --exec` skips the login + rc files, so a profile-bound node manager's node is off PATH; inject
// The PATH a real WSL login shell sees so node/corepack resolve ("" injects nothing, leaving the default PATH).
//
// That login PATH also carries the host's `/mnt/c/<repo>/node_modules/.bin` (WSL Windows-interop appends the Windows
// PATH), whose binaries are the *win32* build. But the sandbox chdir's into the ext4 source mirror, not /mnt/c, so
// That entry is the raw host tree, not the overlaid one — a bare `tsgo`/`eslint`/`oxlint` would resolve the win32
// Binary and crash needing its `-linux-x64` sibling. Prepend the mirror's own node_modules/.bin (overlaid from the
// Snapshot lower = current platform) so the Linux binary wins. Only on win32 (wslLoginPath !== ""): native Linux
// Overlays at cwd, so its PATH already resolves the correct binary and needs no prepend.
export const createOsExecOptions = (cwd: string, stdio: ExecStdio): ExecOptions => {
  const sharedPackageStoreOptions = createSharedPackageStoreOptions(cwd, getOsCacheRoot(cwd));
  const wslLoginPath = process.platform === "win32" ? readWslLoginPath() : "";
  const path =
    wslLoginPath === ""
      ? ""
      : `${getWslSourceMirrorPath(resolveCwd(cwd))}/${NODE_MODULES_BIN_DIRECTORY}:${wslLoginPath}`;
  return {
    ...sharedPackageStoreOptions,
    cwd,
    env: {
      ...(path === "" ? {} : { PATH: path }),
      ...sharedPackageStoreOptions.env,
      [VIRRUN_ENV_KEY]: "true",
    },
    isNetworkEnabled: true,
    stdio,
  };
};
