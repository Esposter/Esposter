import { checkIsInvestigationSpawning } from "#src/services/investigation/checkIsInvestigationSpawning";
import { INVESTIGATION_DAILY_CAP } from "#src/services/investigation/constants";
import { describe, expect, test } from "vitest";

describe(checkIsInvestigationSpawning, () => {
  test("spots spawn until the daily cap of investigations is reached", () => {
    expect.hasAssertions();
    expect(checkIsInvestigationSpawning(INVESTIGATION_DAILY_CAP - 1)).toBe(true);
    expect(checkIsInvestigationSpawning(INVESTIGATION_DAILY_CAP)).toBe(false);
  });
});
