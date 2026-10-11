import type { MachineStateFile } from "#src/models/machine/MachineStateFile";

import { MachineState } from "#src/models/machine/MachineState";
import { MACHINE_STATE_STALE_MILLISECONDS } from "#src/services/machine/constants";
import { WATCHER_ACTION, WATCHER_MISSING_TEXT } from "#src/services/resume/constants";
import { getWatcherItems } from "#src/services/resume/getWatcherItems";
import { describe, expect, test } from "vitest";

describe(getWatcherItems, () => {
  const NOW_MILLISECONDS = 0;
  const MISSING = [{ action: WATCHER_ACTION, text: WATCHER_MISSING_TEXT }];
  const STATE: MachineStateFile = {
    at: Temporal.Instant.fromEpochMilliseconds(NOW_MILLISECONDS).toString(),
    cpuPercentage: 0,
    freeGigabytes: 0,
    minutesInState: 0,
    processId: 0,
    state: MachineState.Busy,
  };

  test("has no leftover while the reading is fresh and its process alive", () => {
    expect.hasAssertions();

    expect(getWatcherItems(STATE, NOW_MILLISECONDS, true)).toStrictEqual([]);
  });

  test("is a leftover when no reading has been written", () => {
    expect.hasAssertions();

    expect(getWatcherItems(undefined, NOW_MILLISECONDS, true)).toStrictEqual(MISSING);
  });

  test("is a leftover once the reading is older than the stale line", () => {
    expect.hasAssertions();

    expect(getWatcherItems(STATE, NOW_MILLISECONDS + MACHINE_STATE_STALE_MILLISECONDS, true)).toStrictEqual(MISSING);
  });

  test("is a leftover when the process that wrote the reading has exited", () => {
    expect.hasAssertions();

    expect(getWatcherItems(STATE, NOW_MILLISECONDS, false)).toStrictEqual(MISSING);
  });
});
