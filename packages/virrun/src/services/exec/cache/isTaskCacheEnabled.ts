import { CI_ENV_KEY, VIRRUN_NO_CACHE_KEY } from "@/services/exec/util/constants";
// Whether the task cache is active. Default-on for persist runs, with two opt-outs (specs/config-and-cache.md):
//   - CI (truthy CI env var) — a fresh commit changes the source hash, so hits are ~0; the cache is a dev-loop lever,
//     not a CI one, and would only add source-hash cost per command.
//   - VIRRUN_NO_CACHE (the env form of `virrun --no-cache`) — explicit per-run opt-out to force real execution.
export const isTaskCacheEnabled = (): boolean => {
  const ci = process.env[CI_ENV_KEY];
  const isCi = ci !== undefined && ci !== "" && ci !== "false" && ci !== "0";
  return !isCi && process.env[VIRRUN_NO_CACHE_KEY] === undefined;
};
