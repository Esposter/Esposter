import type { PrepareStep } from "#src/models/virrun/PrepareStep";

import { Environment } from "#src/models/virrun/Environment";
import { NUXT_OUTPUT_DIRECTORY, NUXT_PREPARE_COMMAND } from "#src/services/configuration/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { resolveWorkspaceRoot } from "#src/services/exec/util/resolveWorkspaceRoot";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { basename, dirname } from "node:path";
// Matches nuxt.config.{js,ts,mjs,cjs,mts,cts} — the config file whose owning package `nuxt prepare` regenerates.
const NUXT_CONFIG_REGEX = /^nuxt\.config\.[cm]?[jt]s$/u;
// Resolve the concrete prepare step for an environment preset (there are no user overrides — every field is
// Preset-derived). An absent (`undefined`) environment has no prepare step. `nuxt` locates the git-tracked nuxt.config
// (git ls-files avoids a glob dependency and is already the source-hash mechanism), targets its package by path filter
// So the command is name-independent, and owns that package's `.nuxt`. Throws if `nuxt` is selected but no nuxt.config
// Exists — a misconfiguration to surface loudly rather than silently skipping the layer and serving the host copy.
export const resolvePrepareStep = (environment: Environment | undefined, cwd: string): PrepareStep | undefined => {
  if (!environment) return undefined;
  const workspaceRoot = resolveWorkspaceRoot(cwd);
  // Piping git's stderr (the stdio option) rather than inheriting it, so a non-repo workspace's "fatal: not a git
  // Repository" (which the getResult below already falls back on) never leaks to the console.
  const configPath = getResult(() =>
    execFileHidden("git", ["ls-files", "--", "*nuxt.config.*"], {
      cwd: workspaceRoot,
      stdio: ["ignore", "pipe", "pipe"],
    }),
  )
    .match(
      (output) => output.split("\n").map((line) => line.trim()),
      () => [],
    )
    .find((line) => NUXT_CONFIG_REGEX.test(basename(line)));
  if (configPath === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      resolvePrepareStep.name,
      `environment "${Environment.Nuxt}" is set but no nuxt.config was found in the workspace`,
    );
  const relativeDir = dirname(configPath);
  if (relativeDir === ".") return { command: NUXT_PREPARE_COMMAND, outputs: [NUXT_OUTPUT_DIRECTORY] };
  return {
    command: `pnpm --filter ./${relativeDir} exec ${NUXT_PREPARE_COMMAND}`,
    outputs: [`${relativeDir}/${NUXT_OUTPUT_DIRECTORY}`],
  };
};
