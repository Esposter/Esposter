import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { FILL_RULES_LINE } from "#src/services/fleet/constants";
import { getFillBrief } from "#src/services/fleet/getFillBrief";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { describe, expect, test } from "vitest";

describe(getFillBrief, () => {
  const WORKER = "w1";
  const QUEUE_LINE = "- [ ] `[page]` {login-door} — Writes `a.ts`.";
  const UNIT = {
    area: "area",
    id: "area--page",
    kind: FleetEntryKind.Unit,
    lane: "",
    line: "",
    needs: [],
    touches: [],
    waiting: "",
  } satisfies FleetEntry;
  const QUEUE_ITEM = {
    area: "genshin",
    id: "login-door",
    kind: FleetEntryKind.Queue,
    lane: "page",
    line: QUEUE_LINE,
    needs: [],
    touches: [],
    waiting: "",
  } satisfies FleetEntry;

  test("names a unit's page, its release and the rules", () => {
    expect.hasAssertions();

    expect(getFillBrief(UNIT, WORKER)).toStrictEqual(
      [
        `Entry area--page, worker ${WORKER}.`,
        `Spec: ${PROPOSALS_DIRECTORY}/area/page.md`,
        `Release: pnpm ai:fleet:release area--page --worker ${WORKER}`,
        FILL_RULES_LINE,
      ].join("\n"),
    );
  });

  test("quotes a queue item's roadmap line whole", () => {
    expect.hasAssertions();

    expect(getFillBrief(QUEUE_ITEM, WORKER)).toStrictEqual(
      [
        `Entry login-door, worker ${WORKER}.`,
        `Roadmap line: ${QUEUE_LINE}`,
        `Release: pnpm ai:fleet:release login-door --worker ${WORKER}`,
        FILL_RULES_LINE,
      ].join("\n"),
    );
  });
});
