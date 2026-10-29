import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { CLAUDE_PROJECTS_DIRECTORY, MEMORY_FOLDER_NAME, MEMORY_NEXT } from "#src/services/setup/constants";
import { readMemoryRow } from "#src/services/setup/readMemoryRow";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

describe(readMemoryRow, () => {
  const MAIN_CHECKOUT_ROOT = "/Users/ada/Esposter";
  const MEMORY_DIRECTORY = join(CLAUDE_PROJECTS_DIRECTORY, "-Users-ada-Esposter", MEMORY_FOLDER_NAME);
  const createEnvironment = (overrides: Partial<SetupEnvironment> = {}): SetupEnvironment => ({
    countFiles: () => undefined,
    exists: () => false,
    makeDirectory: vi.fn(),
    mainCheckoutRoot: MAIN_CHECKOUT_ROOT,
    readText: () => undefined,
    run: () => ({ status: 1, stdout: "" }),
    runVisibly: vi.fn(() => ({ status: 0, stdout: null })),
    ...overrides,
  });

  test("counts the memory folder of the main checkout, not the worktree's", () => {
    expect.hasAssertions();

    const environment = createEnvironment({ countFiles: (path) => (path === MEMORY_DIRECTORY ? 15 : undefined) });

    expect(readMemoryRow(environment)).toStrictEqual({
      next: `15 files at ${MEMORY_DIRECTORY}; ${MEMORY_NEXT}`,
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
});
