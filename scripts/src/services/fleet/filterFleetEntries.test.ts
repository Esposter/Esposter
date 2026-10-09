import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { checkIsFleetEntryKind, filterFleetEntries } from "#src/services/fleet/filterFleetEntries";
import { describe, expect, test } from "vitest";

const createEntry = (overrides: Partial<FleetEntry>): FleetEntry => ({
  area: "genshin",
  id: "first",
  kind: FleetEntryKind.Queue,
  lane: "cpu",
  needs: [],
  touches: [],
  waiting: "",
  ...overrides,
});
describe(filterFleetEntries, () => {
  const ENTRIES = [
    createEntry({ id: "page-item", lane: "page" }),
    createEntry({ id: "cpu-item" }),
    createEntry({ id: "unit", kind: FleetEntryKind.Unit, lane: "" }),
  ];

  test("keeps every entry when no lane or kind is named", () => {
    expect.hasAssertions();

    expect(filterFleetEntries(ENTRIES, "", "")).toStrictEqual(ENTRIES);
  });

  test("keeps only the queue items of one lane, so a page runner never takes a cpu item", () => {
    expect.hasAssertions();

    expect(filterFleetEntries(ENTRIES, "page", "").map(({ id }) => id)).toStrictEqual(["page-item"]);
  });

  test("keeps only the entries of one kind, and a unit, which has no lane, never matches a named lane", () => {
    expect.hasAssertions();

    expect(filterFleetEntries(ENTRIES, "", FleetEntryKind.Unit).map(({ id }) => id)).toStrictEqual(["unit"]);
    expect(filterFleetEntries(ENTRIES, "cpu", FleetEntryKind.Unit)).toStrictEqual([]);
  });

  test("keeps the queue items of a lane and kind named together", () => {
    expect.hasAssertions();

    expect(filterFleetEntries(ENTRIES, "cpu", FleetEntryKind.Queue).map(({ id }) => id)).toStrictEqual(["cpu-item"]);
  });
});

describe(checkIsFleetEntryKind, () => {
  test("accepts the kinds a fleet entry has, and no other value", () => {
    expect.hasAssertions();

    expect(checkIsFleetEntryKind(FleetEntryKind.Queue)).toBe(true);
    expect(checkIsFleetEntryKind("units")).toBe(false);
  });
});
