import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { describe, vi } from "vitest";

// The machine a setup step reads when a test says nothing: no file in place, no command succeeding, and an install that
// succeeds, so a suite overrides only the fact it answers for
export const createSetupEnvironment = (overrides: Partial<SetupEnvironment> = {}): SetupEnvironment => ({
  countFiles: () => undefined,
  exists: () => false,
  makeDirectory: vi.fn<(path: string) => void>(),
  readText: () => undefined,
  run: () => ({ status: 1, stdout: "" }),
  runVisibly: vi.fn(() => ({ status: 0, stdout: null })),
  ...overrides,
});

describe.todo("createSetupEnvironment");
