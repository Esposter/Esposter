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
// The os backend's ExecOptions for the snapshot-provisioning install. Extends createOsExecOptions with the two
// Things only the capture run needs: a writable corepack home on a stable path (so the WSL `corepack pnpm`
// Bootstrap and the pnpm it downloads persist into the snapshot instead of vanishing in the tmpfs upper), bound
// Beside the pnpm store under the same cache root for reuse across runs; and CI=true, which stops pnpm aborting
// The workspace node_modules purge for lack of a TTY (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY) when the host's
// Node_modules show through the overlay lower.
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
