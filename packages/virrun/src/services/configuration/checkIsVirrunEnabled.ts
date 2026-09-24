import { VIRRUN_ENV_KEY, VIRRUN_ENV_VALUE } from "#src/services/exec/util/constants";
// True when the process runs under virrun, read from the `VIRRUN` signal it injects (the way you'd check
// `process.env.VITEST`). Means "running under virrun" for any backend, not "isolated" specifically.
export const checkIsVirrunEnabled = (env: NodeJS.ProcessEnv): boolean =>
  env[VIRRUN_ENV_KEY]?.trim().toLowerCase() === VIRRUN_ENV_VALUE;
