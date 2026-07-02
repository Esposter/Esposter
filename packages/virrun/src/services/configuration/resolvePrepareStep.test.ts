import { Environment } from "@/models/virrun/Environment";
import { NUXT_OUTPUT_DIRECTORY, NUXT_PREPARE_COMMAND } from "@/services/configuration/constants";
import { resolvePrepareStep } from "@/services/configuration/resolvePrepareStep";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
// A canonical nuxt.config filename (an instance of NUXT_CONFIG_PATTERN) for the fixture to stage. git ls-files only
// Reports tracked files, so the fixture inits a repo and stages the config for detection.
const NUXT_CONFIG_FILENAME = "nuxt.config.ts";
const initRepositoryWith = (workspace: string, relativeDir: string): void => {
  execFileSync("git", ["init", "-q"], { cwd: workspace });
  mkdirSync(join(workspace, relativeDir), { recursive: true });
  writeFileSync(join(workspace, relativeDir, NUXT_CONFIG_FILENAME), "");
  execFileSync("git", ["add", "-A"], { cwd: workspace });
};

describe(resolvePrepareStep, () => {
  const { cleanup, createWorkspace } = createTemporaryDirectoryTracker();

  afterEach(() => {
    cleanup();
  });

  test(`is undefined for ${Environment.None}`, () => {
    expect.hasAssertions();

    expect(resolvePrepareStep(Environment.None, createWorkspace())).toBeUndefined();
  });

  test(`targets a nested nuxt package by path filter for ${Environment.Nuxt}`, () => {
    expect.hasAssertions();

    const workspace = createWorkspace();
    const packageDir = `${TEST_FILENAME}/${TEST_FILENAME}`;
    initRepositoryWith(workspace, packageDir);

    expect(resolvePrepareStep(Environment.Nuxt, workspace)).toStrictEqual({
      command: `pnpm --filter ./${packageDir} exec ${NUXT_PREPARE_COMMAND}`,
      outputs: [`${packageDir}/${NUXT_OUTPUT_DIRECTORY}`],
    });
  });

  test("runs prepare at the root when nuxt.config sits at the workspace root", () => {
    expect.hasAssertions();

    const workspace = createWorkspace();
    initRepositoryWith(workspace, ".");

    expect(resolvePrepareStep(Environment.Nuxt, workspace)).toStrictEqual({
      command: NUXT_PREPARE_COMMAND,
      outputs: [NUXT_OUTPUT_DIRECTORY],
    });
  });

  test(`throws when ${Environment.Nuxt} is set but no nuxt.config exists`, () => {
    expect.hasAssertions();

    const workspace = createWorkspace();
    execFileSync("git", ["init", "-q"], { cwd: workspace });

    expect(() => resolvePrepareStep(Environment.Nuxt, workspace)).toThrow(
      new InvalidOperationError(
        Operation.Read,
        resolvePrepareStep.name,
        `environment "${Environment.Nuxt}" is set but no nuxt.config was found in the workspace`,
      ),
    );
  });
});
