import { getParityBuildKey } from "#src/services/genshinParity/load/getParityBuildKey";
import {
  GENSHIN_WORLD_DIRECTORY,
  PARITY_BUILD_DIRECTORY,
  PARITY_BUILD_DIRECTORY_NAME,
  PARITY_BUILD_KEY_FILE_NAME,
  PARITY_CONFIG_PATH,
  VITE_BIN_PATH,
} from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Builds the parity page for production into its folder in the world package. A build is reused while its key matches
// The commit and the changed files beside it, so a load run after the first pays for the build only when something it
// Reads has moved
export const buildParityPage = (): void => {
  const key = getParityBuildKey();
  const keyPath = join(PARITY_BUILD_DIRECTORY, PARITY_BUILD_KEY_FILE_NAME);
  if (existsSync(keyPath) && readFileSync(keyPath, "utf8") === key) return;

  const buildStatus = spawnSync(
    process.execPath,
    [
      VITE_BIN_PATH,
      "build",
      "--config",
      PARITY_CONFIG_PATH,
      "--mode",
      "production",
      "--outDir",
      PARITY_BUILD_DIRECTORY_NAME,
      "--emptyOutDir",
    ],
    { cwd: GENSHIN_WORLD_DIRECTORY, stdio: "inherit" },
  ).status;
  if (buildStatus !== 0)
    throw new InvalidOperationError(Operation.Create, PARITY_BUILD_DIRECTORY, `its build exited with ${buildStatus}`);

  writeFileSync(keyPath, key);
};
