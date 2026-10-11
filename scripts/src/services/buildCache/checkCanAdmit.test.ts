import type { CanAdmitOptions } from "#src/models/buildCache/CanAdmitOptions";

import { SLOT_MEMORY_DIVISOR, SLOT_RAMP_SECONDS } from "#src/services/buildCache/constants";
import { checkCanAdmit } from "#src/services/buildCache/checkCanAdmit";
import { describe, expect, test } from "vitest";

describe(checkCanAdmit, () => {
  const totalMemory = 8 * SLOT_MEMORY_DIVISOR;
  const admittedAt = 1000;
  const admittedPid = 2;
  const createOptions = (options: Partial<CanAdmitOptions>): CanAdmitOptions => ({
    admission: undefined,
    freeMemory: totalMemory,
    isProcessAlive: () => true,
    now: admittedAt,
    totalMemory,
    ...options,
  });

  test("reads free memory at the gate as no admission", () => {
    expect.hasAssertions();

    expect(checkCanAdmit(createOptions({ freeMemory: totalMemory / SLOT_MEMORY_DIVISOR }))).toBe(false);
  });

  test("reads free memory above the gate with no earlier admission as an admission", () => {
    expect.hasAssertions();

    expect(checkCanAdmit(createOptions({}))).toBe(true);
  });

  test("reads an earlier admission inside its ramp, with its holder alive, as no admission", () => {
    expect.hasAssertions();

    expect(
      checkCanAdmit(createOptions({ admission: { admittedAt, admittedPid }, now: admittedAt + SLOT_RAMP_SECONDS - 1 })),
    ).toBe(false);
  });

  test("reads an earlier admission past its ramp as an admission", () => {
    expect.hasAssertions();

    expect(
      checkCanAdmit(createOptions({ admission: { admittedAt, admittedPid }, now: admittedAt + SLOT_RAMP_SECONDS })),
    ).toBe(true);
  });

  test("reads an earlier admission inside its ramp whose holder died as an admission", () => {
    expect.hasAssertions();

    expect(
      checkCanAdmit(
        createOptions({ admission: { admittedAt, admittedPid }, isProcessAlive: () => false, now: admittedAt }),
      ),
    ).toBe(true);
  });
});
