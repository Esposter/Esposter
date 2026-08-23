import type { ExecOptions } from "#src/models/exec/ExecOptions";

import { COREPACK_HOME_KEY, PNPM_CONFIG_STORE_DIR_KEY } from "#src/services/exec/util/constants";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";

const WSL_PATH_ENV_KEYS = new Set([COREPACK_HOME_KEY, PNPM_CONFIG_STORE_DIR_KEY]);

export const createWslEnvArgs = ({ env = {} }: Pick<ExecOptions, "env">): string[] =>
  Object.entries(env).map(([key, value]) => `${key}=${WSL_PATH_ENV_KEYS.has(key) ? readWslPath(value) : value}`);
