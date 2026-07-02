import type { PrepareStep } from "@/models/virrun/PrepareStep";

import { Environment } from "@/models/virrun/Environment";
import { NUXT_OUTPUT_DIRECTORY, NUXT_PREPARE_COMMAND } from "@/services/configuration/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { basename, dirname } from "node:path";
// Matches nuxt.config.{js,ts,mjs,cjs,mts,cts} — the config file whose owning package `nuxt prepare` regenerates.
const NUXT_CONFIG_PATTERN = /^nuxt\.config\.[cm]?[jt]s$/u;
// Resolve the concrete prepare step for an environment preset (there are no user overrides — every field is
// Preset-derived). `none` has no prepare step. `nuxt` locates the git-tracked nuxt.config (git ls-files avoids a
// Glob dependency and is already the source-hash mechanism), targets its package by path filter so the command is
// Name-independent, and owns that package's `.nuxt`. Throws if `nuxt` is selected but no nuxt.config exists — a
// Misconfiguration to surface loudly rather than silently skipping the layer and serving the host copy.
export const resolvePrepareStep = (environment: Environment, cwd: string): PrepareStep | undefined => {
  if (environment === Environment.None) return undefined;
  const workspaceRoot = resolveWorkspaceRoot(cwd);
  const configPath = getResult(() =>
    execFileSync("git", ["ls-files", "--", "*nuxt.config.*"], { cwd: workspaceRoot, encoding: "utf8" }),
  )
    .match(
      (output) => output.split("\n").map((line) => line.trim()),
      () => [],
    )
    .find((line) => NUXT_CONFIG_PATTERN.test(basename(line)));
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
