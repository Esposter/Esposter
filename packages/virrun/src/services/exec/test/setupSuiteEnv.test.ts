import { afterAll, beforeAll, describe } from "vitest";
// `unstubEnvs` restores every `vi.stubEnv` before each test, so a value a suite's beforeAll sets through it is gone
// By the suite's first test. A suite-scoped override assigns process.env directly and puts the previous values back
// After the suite; `undefined` unsets a key, because process.env stringifies an assigned undefined. The values are
// Read inside beforeAll, so a getter that probes the host (a WSL cache root) never runs for a skipped describe.
const applyEnv = (key: string, value: string | undefined): void => {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
};

export const setupSuiteEnv = (getValues: () => Record<string, string | undefined>): void => {
  const previousValues = new Map<string, string | undefined>();

  beforeAll(() => {
    for (const [key, value] of Object.entries(getValues())) {
      previousValues.set(key, process.env[key]);
      applyEnv(key, value);
    }
  });

  afterAll(() => {
    for (const [key, value] of previousValues) applyEnv(key, value);
  });
};

describe.todo("setupSuiteEnv");
