import type { MachineStateFile } from "#src/models/machine/MachineStateFile";

import { MachineState } from "#src/models/machine/MachineState";
import { checkIsWatching } from "#src/services/machine/checkIsWatching";
import { MACHINE_STATE_STALE_MILLISECONDS } from "#src/services/machine/constants";
import { describe, expect, test } from "vitest";

describe(checkIsWatching, () => {
  const AT = Temporal.Instant.fromEpochMilliseconds(0).toString();
  const OWN_PROCESS_ID = 1;
  const OTHER_PROCESS_ID = process.ppid;
  const state = (processId: number): MachineStateFile => ({
    at: AT,
    cpuPercentage: 0,
    freeGigabytes: 0,
    minutesInState: 0,
    processId,
    state: MachineState.Idle,
  });

  test("is not watching when no reading exists", () => {
    expect.hasAssertions();

    expect(checkIsWatching(undefined, OWN_PROCESS_ID, 0)).toBe(false);
  });

  test("is not watching when the reading is the process's own", () => {
    expect.hasAssertions();

    expect(checkIsWatching(state(OWN_PROCESS_ID), OWN_PROCESS_ID, 0)).toBe(false);
  });

  test("is watching when another live process has a fresh reading", () => {
    expect.hasAssertions();

    expect(checkIsWatching(state(OTHER_PROCESS_ID), OWN_PROCESS_ID, 0)).toBe(true);
  });

  test("is not watching once the reading is stale", () => {
    expect.hasAssertions();

    expect(checkIsWatching(state(OTHER_PROCESS_ID), OWN_PROCESS_ID, MACHINE_STATE_STALE_MILLISECONDS)).toBe(false);
  });
});
