import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { SetupStatus } from "#src/models/setup/SetupStatus";
import { DATA_VERIFY_ARGS } from "#src/services/setup/constants";
import { readSetupRows } from "#src/services/setup/readSetupRows";
import { describe, expect, test, vi } from "vitest";

describe(readSetupRows, () => {
  const createEnvironment = (overrides: Partial<SetupEnvironment> = {}): SetupEnvironment => ({
    countFiles: () => undefined,
    exists: () => false,
    makeDirectory: vi.fn(),
    readText: () => undefined,
    run: () => ({ status: 1, stdout: "" }),
    runVisibly: vi.fn(() => ({ status: 0, stdout: null })),
    ...overrides,
  });
  const stepRow = (rows: ReturnType<typeof readSetupRows>, step: string) => rows.find((row) => row.step === step);

  test("neither the install nor the hosted data's check runs unless asked for", () => {
    expect.hasAssertions();

    const environment = createEnvironment();

    const rows = readSetupRows({ install: false, verify: false }, environment, "darwin");

    expect(environment.runVisibly).not.toHaveBeenCalled();
    expect(stepRow(rows, "dependencies")?.status).toBe(SetupStatus.NeedsYou);
    expect(stepRow(rows, "game data lock")?.status).toBe(SetupStatus.Info);
  });

  test("the install runs when asked for and the dependencies are missing", () => {
    expect.hasAssertions();

    const environment = createEnvironment();

    const rows = readSetupRows({ install: true, verify: false }, environment, "darwin");

    expect(environment.runVisibly).toHaveBeenCalledWith(PNPM_FILE, [...PNPM_ARGS, "i"]);
    expect(stepRow(rows, "dependencies")?.status).toBe(SetupStatus.Done);
  });

  test("the hosted data's check runs when asked for, and its failure needs the person", () => {
    expect.hasAssertions();

    const environment = createEnvironment({ runVisibly: vi.fn(() => ({ status: 1, stdout: null })) });

    const rows = readSetupRows({ install: false, verify: true }, environment, "darwin");

    expect(environment.runVisibly).toHaveBeenCalledWith(PNPM_FILE, [...PNPM_ARGS, ...DATA_VERIFY_ARGS]);
    expect(stepRow(rows, "game data lock")?.status).toBe(SetupStatus.NeedsYou);
  });
});
