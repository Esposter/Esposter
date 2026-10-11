import { BUILD_CACHE_RUN_IN_SLOT_PATH } from "#src/services/buildCache/constants";
import { getParityBuildKey } from "#src/services/genshinParity/load/getParityBuildKey";
import {
  GENSHIN_WORLD_DIRECTORY,
  PARITY_BUILD_DIRECTORY,
  PARITY_BUILD_DIRECTORY_NAME,
  PARITY_BUILD_KEY_FILE_NAME,
  PARITY_CONFIG_PATH,
  VITE_BIN_PATH,
} from "#src/services/genshinParity/shared/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Builds the parity page for production into its folder in the world package, through a run slot as the package builds
// Are. A build is reused while its key matches the commit and the changed files beside it, so a load run after the first
// Pays for the build only when something it reads has moved
export const buildParityPage = (): void => {
  const key = getParityBuildKey();
  const keyPath = join(PARITY_BUILD_DIRECTORY, PARITY_BUILD_KEY_FILE_NAME);
  if (existsSync(keyPath) && readFileSync(keyPath, "utf8") === key) return;

  const build = spawnSync(
    "bash",
    [
      join(REPOSITORY_ROOT, BUILD_CACHE_RUN_IN_SLOT_PATH),
      "node",
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
  );
  if (build.status !== 0)
    throw new InvalidOperationError(Operation.Create, PARITY_BUILD_DIRECTORY, `its build exited with ${build.status}`);

  writeFileSync(keyPath, key);
};
