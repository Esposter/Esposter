import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { STALE_MILLISECONDS } from "#src/services/fleet/constants";
import { selectTakeableEntries } from "#src/services/fleet/selectTakeableEntries";
import { describe, expect, test } from "vitest";

const NOW = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).epochMilliseconds;
const RECENT = Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: 55 }).toString();
const OLD = Temporal.Instant.fromEpochMilliseconds(NOW - STALE_MILLISECONDS - 1).toString();
const PROFILE: MachineProfile = { areas: ["genshin"], capabilities: ["game-install"], id: "pc" };
const createEntry = (overrides: Partial<FleetEntry>): FleetEntry => ({
  area: "genshin",
  id: "first",
  kind: FleetEntryKind.Queue,
  lane: "cpu",
  needs: [],
  touches: [],
  ...overrides,
});
const createClaim = (renewedAt: string, miss?: string): ClaimedRef => ({
  message: {
    claimedAt: RECENT,
    entry: "",
    load: "",
    machine: "other",
    renewedAt,
    ...(miss === undefined ? {} : { miss }),
  },
  sha: "a".repeat(40),
});

describe(selectTakeableEntries, () => {
  test("lists the entries the machine meets the needs of and lends the area, in order", () => {
    expect.hasAssertions();

    const entries = [
      createEntry({ id: "needs-game", needs: ["game-install"] }),
      createEntry({ id: "needs-exports", needs: ["game-exports"] }),
      createEntry({ area: "esbabbler", id: "other-area" }),
      createEntry({ id: "anyone" }),
    ];

    expect(selectTakeableEntries(entries, PROFILE, new Map(), NOW).map(({ id }) => id)).toStrictEqual([
      "needs-game",
      "anyone",
    ]);
  });

  test("lists every area for a machine lent everything", () => {
    expect.hasAssertions();

    const entries = [createEntry({ area: "esbabbler", id: "other-area" })];

    expect(selectTakeableEntries(entries, { ...PROFILE, areas: ["*"] }, new Map(), NOW)).toStrictEqual(entries);
  });

  test("skips an entry a live claim holds, and takes over one whose claim is stale", () => {
    expect.hasAssertions();

    const entries = [createEntry({ id: "held" }), createEntry({ id: "stale" })];
    const claims = new Map([
      ["held", createClaim(RECENT)],
      ["stale", createClaim(OLD)],
    ]);

    expect(selectTakeableEntries(entries, PROFILE, claims, NOW).map(({ id }) => id)).toStrictEqual(["stale"]);
  });

  test("keeps a missed entry out, however old its claim", () => {
    expect.hasAssertions();

    const claims = new Map([["missed", createClaim(OLD, "3 of 5")]]);

    expect(selectTakeableEntries([createEntry({ id: "missed" })], PROFILE, claims, NOW)).toStrictEqual([]);
  });

  test("skips an entry whose touch set overlaps a live claim's entry", () => {
    expect.hasAssertions();

    const entries = [
      createEntry({ id: "writer", touches: ["extracted/natlan/"] }),
      createEntry({ id: "overlapping", touches: ["extracted/natlan/world.json"] }),
      createEntry({ id: "separate", touches: ["extracted/liyue/"] }),
    ];
    const claims = new Map([["writer", createClaim(RECENT)]]);

    expect(selectTakeableEntries(entries, PROFILE, claims, NOW).map(({ id }) => id)).toStrictEqual(["separate"]);
  });
});
