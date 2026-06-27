import type { ExecOptions } from "@/models/exec/ExecOptions";

import { COREPACK_HOME_KEY, PNPM_CONFIG_STORE_DIR_KEY } from "@/services/exec/constants";
import { readWslPath } from "@/services/exec/readWslPath";

const WSL_PATH_ENV_KEYS = new Set([COREPACK_HOME_KEY, PNPM_CONFIG_STORE_DIR_KEY]);

export const createWslEnvArgs = ({ env = {} }: Pick<ExecOptions, "env">): string[] =>
  Object.entries(env).map(([key, value]) => `${key}=${WSL_PATH_ENV_KEYS.has(key) ? readWslPath(value) : value}`);
