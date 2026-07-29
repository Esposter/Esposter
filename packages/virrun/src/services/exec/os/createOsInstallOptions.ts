import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";

import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { CI_ENV_KEY, CI_ENV_VALUE } from "@/services/exec/util/constants";
// CreateOsExecOptions plus the one thing only the capture install needs: CI=true, which stops pnpm aborting the
// Node_modules purge for lack of a TTY (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY) when the host's node_modules show
// Through the overlay lower. The writable corepack home lives in createOsExecOptions — every sandboxed command that
// Shells out to `pnpm` needs it, not just this install.
export const createOsInstallOptions = (cwd: string, stdio: ExecStdio): ExecOptions => {
  const options = createOsExecOptions(cwd, stdio);
  return { ...options, env: { ...options.env, [CI_ENV_KEY]: CI_ENV_VALUE } };
};
