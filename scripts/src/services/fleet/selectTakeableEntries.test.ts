import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { STALE_MILLISECONDS } from "#src/services/fleet/constants";
import { selectTakeableEntries } from "#src/services/fleet/selectTakeableEntries";
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
describe(selectTakeableEntries, () => {
  const NOW = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).epochMilliseconds;
  const RECENT = Temporal.Instant.fromEpochMilliseconds(0).add({ minutes: 55 }).toString();
  const OLD = Temporal.Instant.fromEpochMilliseconds(NOW - STALE_MILLISECONDS - 1).toString();
  const PROFILE: MachineProfile = { areas: ["genshin"], capabilities: ["game-install"], id: "pc" };
  const createClaim = (renewedAt: string, miss?: string): ClaimedRef => ({
    message: {
      claimedAt: RECENT,
      entry: "",
      load: "",
      machine: "other",
      renewedAt,
      worker: "9c01",
      ...(miss === undefined ? {} : { miss }),
    },
    sha: "a".repeat(40),
  });

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

  test("skips an entry a live claim of another worker on this machine holds", () => {
    expect.hasAssertions();

    const entries = [createEntry({ id: "first" }), createEntry({ id: "second" })];
    const otherWorkerClaim: ClaimedRef = {
      message: { claimedAt: RECENT, entry: "first", load: "", machine: PROFILE.id, renewedAt: RECENT, worker: "7f3a" },
      sha: "a".repeat(40),
    };

    expect(
      selectTakeableEntries(entries, PROFILE, new Map([["first", otherWorkerClaim]]), NOW).map(({ id }) => id),
    ).toStrictEqual(["second"]);
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

  test("skips a unit waiting on a blocker, and lists it again once the blocker is gone", () => {
    expect.hasAssertions();

    const waiting = createEntry({ id: "companionship", kind: FleetEntryKind.Unit, lane: "", waiting: "namecard art" });
    const ready = createEntry({ id: "ready", kind: FleetEntryKind.Unit, lane: "" });

    expect(selectTakeableEntries([waiting, ready], PROFILE, new Map(), NOW).map(({ id }) => id)).toStrictEqual([
      "ready",
    ]);
    expect(
      selectTakeableEntries([{ ...waiting, waiting: "" }], PROFILE, new Map(), NOW).map(({ id }) => id),
    ).toStrictEqual(["companionship"]);
  });

  test("skips a unit needing a capability the machine lacks", () => {
    expect.hasAssertions();

    const unit = createEntry({ id: "profile", kind: FleetEntryKind.Unit, lane: "", needs: ["game-exports"] });

    expect(selectTakeableEntries([unit], PROFILE, new Map(), NOW)).toStrictEqual([]);
    expect(selectTakeableEntries([unit], { ...PROFILE, capabilities: ["game-exports"] }, new Map(), NOW)).toStrictEqual(
      [unit],
    );
  });

  test("skips a unit whose touch globs overlap a live claim's touch set", () => {
    expect.hasAssertions();

    const claimed = createEntry({
      id: "profile-tab",
      kind: FleetEntryKind.Unit,
      lane: "",
      touches: ["apps/web/app/components/Genshin/Profile/*.vue"],
    });
    const overlapping = createEntry({
      id: "profile-header",
      kind: FleetEntryKind.Unit,
      lane: "",
      touches: ["apps/web/app/components/Genshin/Profile/**"],
    });
    const separate = createEntry({
      id: "inventory",
      kind: FleetEntryKind.Unit,
      lane: "",
      touches: ["apps/web/app/components/Genshin/Inventory/*.vue"],
    });
    const claims = new Map([["profile-tab", createClaim(RECENT)]]);

    expect(
      selectTakeableEntries([claimed, overlapping, separate], PROFILE, claims, NOW).map(({ id }) => id),
    ).toStrictEqual(["inventory"]);
  });
});
