import type { ExecOptions } from "@/models/exec/ExecOptions";

import { readWslPath } from "@/services/exec/readWslPath";

export const createWslEnvArgs = ({ env = {} }: Pick<ExecOptions, "env">): string[] =>
  Object.entries(env).map(([key, value]) => `${key}=${key === "npm_config_store_dir" ? readWslPath(value) : value}`);
