import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { checkIsFleetEntryKind } from "#src/services/fleet/checkIsFleetEntryKind";
import { describe, expect, test } from "vitest";

describe(checkIsFleetEntryKind, () => {
  test("accepts the kinds a fleet entry has, and no other value", () => {
    expect.hasAssertions();

    expect(checkIsFleetEntryKind(FleetEntryKind.Queue)).toBe(true);
    expect(checkIsFleetEntryKind("units")).toBe(false);
  });
});
