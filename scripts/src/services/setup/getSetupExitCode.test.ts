import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { getSetupExitCode } from "#src/services/setup/getSetupExitCode";
import { describe, expect, test } from "vitest";

describe(getSetupExitCode, () => {
  const rowWith = (status: SetupStatus): SetupRow => ({ next: "", status, step: "step" });

  test.each([
    [[SetupStatus.Ok, SetupStatus.Done, SetupStatus.Install, SetupStatus.Info], 0],
    [[SetupStatus.Ok, SetupStatus.NeedsYou], 1],
  ])("exits with the code for the statuses %j", (statuses, exitCode) => {
    expect.hasAssertions();

    expect(getSetupExitCode(statuses.map(rowWith))).toBe(exitCode);
  });
});
