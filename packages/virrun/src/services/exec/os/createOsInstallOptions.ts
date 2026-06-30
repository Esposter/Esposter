import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";

import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { getOsCacheRoot } from "@/services/exec/os/getOsCacheRoot";
import {
  CI_ENV_KEY,
  CI_ENV_VALUE,
  COREPACK_HOME_KEY,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
// createOsExecOptions plus the two things only the capture install needs: a writable corepack home on a stable
// Path (so the WSL `corepack pnpm` bootstrap persists into the snapshot instead of vanishing in the tmpfs upper),
// And CI=true, which stops pnpm aborting the node_modules purge for lack of a TTY
// (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY) when the host's node_modules show through the overlay lower.
export const createOsInstallOptions = (cwd: string, stdio: ExecStdio): ExecOptions => {
  const options = createOsExecOptions(cwd, stdio);
  const corepackHome = join(getOsCacheRoot(cwd), VIRRUN_STORE_DIRECTORY_NAME, VIRRUN_COREPACK_STORE_DIRECTORY_NAME);
  mkdirSync(corepackHome, { recursive: true });
  return {
    ...options,
    bindDirs: [...(options.bindDirs ?? []), corepackHome],
    env: {
      ...options.env,
      [CI_ENV_KEY]: CI_ENV_VALUE,
      [COREPACK_HOME_KEY]: corepackHome,
    },
  };
};
