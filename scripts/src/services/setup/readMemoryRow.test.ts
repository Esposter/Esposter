import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { MEMORY_FOLDER_NAME, MEMORY_NEXT } from "#src/services/setup/constants";
import { createSetupEnvironment } from "#src/services/setup/createSetupEnvironment.test";
import { readMemoryRow } from "#src/services/setup/readMemoryRow";
import { CLAUDE_PROJECTS_DIRECTORY } from "#src/services/shared/constants";
import { SITE_NAME } from "@esposter/shared";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readMemoryRow, () => {
  const MAIN_CHECKOUT_ROOT = `/Users/ada/${SITE_NAME}`;
  const MEMORY_DIRECTORY = join(CLAUDE_PROJECTS_DIRECTORY, `-Users-ada-${SITE_NAME}`, MEMORY_FOLDER_NAME);
  const CONFIG_PROJECTS_DIRECTORY = join("/Users/ada/claude-config", "projects");
  const createEnvironment = (overrides: Partial<SetupEnvironment> = {}): SetupEnvironment =>
    createSetupEnvironment({ run: () => ({ status: 0, stdout: `${MAIN_CHECKOUT_ROOT}/.git\n` }), ...overrides });

  test("counts the memory folder of the main checkout, not the worktree's", () => {
    expect.hasAssertions();

    const environment = createEnvironment({ countFiles: (path) => (path === MEMORY_DIRECTORY ? 15 : undefined) });

    expect(readMemoryRow(environment)).toStrictEqual({
      next: `15 files at ${MEMORY_DIRECTORY}; ${MEMORY_NEXT}`,
      status: SetupStatus.Info,
      step: "memory",
    });
  });

  test("counts the memory folder under the projects folder the environment names, which CLAUDE_CONFIG_DIR moves", () => {
    expect.hasAssertions();

    const memoryDirectory = join(CONFIG_PROJECTS_DIRECTORY, `-Users-ada-${SITE_NAME}`, MEMORY_FOLDER_NAME);
    const environment = createEnvironment({
      claudeProjectsDirectory: CONFIG_PROJECTS_DIRECTORY,
      countFiles: (path) => (path === memoryDirectory ? 3 : undefined),
    });

    expect(readMemoryRow(environment)).toStrictEqual({
      next: `3 files at ${memoryDirectory}; ${MEMORY_NEXT}`,
      status: SetupStatus.Info,
      step: "memory",
    });
  });

  test("names the main checkout's folder it looked in when there is none", () => {
    expect.hasAssertions();

    expect(readMemoryRow(createEnvironment())).toStrictEqual({
      next: `no folder at ${MEMORY_DIRECTORY}; ${MEMORY_NEXT}`,
      status: SetupStatus.Info,
      step: "memory",
    });
  });

  test("reports no main checkout, rather than failing, when git cannot answer", () => {
    expect.hasAssertions();

    expect(readMemoryRow(createEnvironment({ run: () => ({ status: null, stdout: null }) }))).toStrictEqual({
      next: `no main checkout to read memory from; ${MEMORY_NEXT}`,
      status: SetupStatus.Info,
      step: "memory",
    });
  });
});
