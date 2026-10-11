import { RUN_IN_SLOT_ENVIRONMENT_NAME } from "#src/services/buildCache/constants";
import { runInSlot } from "#src/services/buildCache/runInSlot";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(runInSlot, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("runs a nested command in place and leaves its parent's slot variable as it was", () => {
    expect.hasAssertions();

    const PARENT_PROCESS_ID = "4242";

    vi.stubEnv(RUN_IN_SLOT_ENVIRONMENT_NAME, PARENT_PROCESS_ID);

    expect(runInSlot(() => process.env[RUN_IN_SLOT_ENVIRONMENT_NAME])).toBe(PARENT_PROCESS_ID);
    expect(process.env[RUN_IN_SLOT_ENVIRONMENT_NAME]).toBe(PARENT_PROCESS_ID);
  });
});
