import { VIRRUN_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// The default WSL distro's ext4 home as a Windows UNC (`\\wsl.localhost\<distro>\home\<user>\.virrun`). virrun's
// Write-heavy cache (snapshot overlay dirs, pnpm store, corepack home) lives here rather than under the repo or `~`
// On the Windows drive, because those resolve to `/mnt/c` (v9fs) inside WSL — 15-64x slower for the many-small-file
// Install, and it silently never finishes capturing the snapshot. readWslPath later maps the UNC back to `/home/...`
// So the bulk writes happen Linux-side at native ext4 speed.
let wslNativeCacheRoot = "";

export const getWslNativeCacheRoot = (): string => {
  if (wslNativeCacheRoot) return wslNativeCacheRoot;
  // `wsl.exe -l -q` lists installed distros (default first) as UTF-16LE; the first non-empty line is the distro
  // `wsl.exe --exec` runs commands in, so its `$HOME` is the matching home directory.
  const distro = getResult(() => execFileSync("wsl.exe", ["-l", "-q"], { encoding: "utf16le", stdio: "pipe" }))
    .map(
      (output) =>
        output
          .split(/\r?\n/u)
          .map((line) => line.trim())
          .find(Boolean) ?? "",
    )
    .unwrapOr("");
  const home = getResult(() =>
    execFileSync("wsl.exe", ["--exec", "sh", "-c", "echo $HOME"], { encoding: "utf8", stdio: "pipe" }),
  )
    .map((output) => output.trim())
    .unwrapOr("");
  if (distro === "" || home === "")
    throw new InvalidOperationError(
      Operation.Read,
      getWslNativeCacheRoot.name,
      "could not resolve the WSL distro or home directory",
    );
  wslNativeCacheRoot = `\\\\wsl.localhost\\${distro}\\${home.replace(/^\//u, "").replaceAll("/", "\\")}\\${VIRRUN_CACHE_DIRECTORY_NAME}`;
  return wslNativeCacheRoot;
};
