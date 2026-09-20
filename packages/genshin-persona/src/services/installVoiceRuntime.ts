import {
  RUNTIME_DIRECTORY,
  RUNTIME_LOCKFILE_PATH,
  RUNTIME_MANIFEST_PATH,
  RUNTIME_SOURCE_DIRECTORY,
} from "#src/services/constants";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";

// The engine's runtime, installed into the state directory from the manifest and lockfile the plugin carries, the
// Way a project's dependencies are installed beside it rather than shipped with it. Lifecycle scripts are off:
// The ONNX runtime's binaries ship in the package, and its only script fetches a CUDA build on Linux. `npm` is
// Present wherever the plugin installed, since the plugin install ran it
export const installVoiceRuntime = (): boolean => {
  mkdirSync(RUNTIME_DIRECTORY, { recursive: true });
  for (const path of [RUNTIME_MANIFEST_PATH, RUNTIME_LOCKFILE_PATH])
    copyFileSync(join(RUNTIME_SOURCE_DIRECTORY, basename(path)), path);
  // One command string through the shell, since `npm` is a shell script on Windows
  const { status } = spawnSync("npm ci --ignore-scripts --no-audit --no-fund", {
    cwd: RUNTIME_DIRECTORY,
    shell: true,
    stdio: "inherit",
  });
  return status === 0;
};
