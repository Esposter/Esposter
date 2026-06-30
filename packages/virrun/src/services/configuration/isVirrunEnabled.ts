import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
// True when the process runs under virrun, read from the `VIRRUN` signal it injects (the way you'd check
// `process.env.VITEST`). Means "running under virrun" for any backend, not "isolated" specifically.
export const isVirrunEnabled = (env: NodeJS.ProcessEnv): boolean =>
  env[VIRRUN_ENV_KEY]?.trim().toLowerCase() === "true";
