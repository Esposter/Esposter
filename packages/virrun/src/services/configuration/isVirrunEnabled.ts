import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
// Consumer-facing detection: true when the current process is running under virrun, read from the `VIRRUN`
// Signal virrun injects into every command it runs (the way you'd check `process.env.VITEST`). Use it from a
// Test, vitest/build config, or tool to branch on the sandbox — e.g. skip a case that needs real host disk. On
// Means the canonical `true` (case- and whitespace-insensitive); any other value, or unset, is off. It detects
// "running under virrun" for any backend, not "isolated" specifically.
export const isVirrunEnabled = (env: NodeJS.ProcessEnv): boolean =>
  env[VIRRUN_ENV_KEY]?.trim().toLowerCase() === "true";
