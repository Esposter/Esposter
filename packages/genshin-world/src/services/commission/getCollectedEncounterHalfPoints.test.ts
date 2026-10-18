import { getCollectedEncounterHalfPoints } from "#src/services/commission/getCollectedEncounterHalfPoints";
import { describe, expect, test } from "vitest";

describe(getCollectedEncounterHalfPoints, () => {
  test("a Crimson Agate earns a half point, and an item the wiki does not list earns none, Mnemonic Cluster among them", () => {
    expect.hasAssertions();
    expect(getCollectedEncounterHalfPoints("107010")).toBe(1);
    expect(getCollectedEncounterHalfPoints("107033")).toBe(0);
    expect(getCollectedEncounterHalfPoints("999999")).toBe(0);
  });
});
