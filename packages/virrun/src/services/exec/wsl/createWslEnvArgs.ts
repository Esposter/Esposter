import type { ExecOptions } from "#src/models/exec/ExecOptions";

import { PNPM_CONFIG_STORE_DIR_KEY } from "#src/services/exec/util/constants";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";

export const createWslEnvArgs = ({ env = {} }: Pick<ExecOptions, "env">): string[] =>
  Object.entries(env).map(([key, value]) => `${key}=${key === PNPM_CONFIG_STORE_DIR_KEY ? readWslPath(value) : value}`);
