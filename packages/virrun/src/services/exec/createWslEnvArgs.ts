import type { ExecOptions } from "@/models/exec/ExecOptions";

import { readWslPath } from "@/services/exec/readWslPath";

const WSL_PATH_ENV_KEYS = new Set(["COREPACK_HOME", "PNPM_CONFIG_STORE_DIR"]);

export const createWslEnvArgs = ({ env = {} }: Pick<ExecOptions, "env">): string[] =>
  Object.entries(env).map(([key, value]) => `${key}=${WSL_PATH_ENV_KEYS.has(key) ? readWslPath(value) : value}`);
