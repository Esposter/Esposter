import type { QueueFile } from "#src/models/fleet/QueueFile";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { readProposalEntries } from "#src/services/fleet/readProposalEntries";
import {
  PROPOSAL_DESIGN_FILE,
  PROPOSAL_METADATA_FILE,
  PROPOSAL_TASKS_FILE,
  PROPOSALS_DIRECTORY,
} from "#src/services/proposals/constants";
import { describe, expect, test } from "vitest";

describe(readProposalEntries, () => {
  const CHANGE = `${PROPOSALS_DIRECTORY}/genshin-first`;

  test("A unit's entry carries its change's pick phase and its metadata's needs, touches and waiting", () => {
    expect.hasAssertions();

    const files: QueueFile[] = [
      { path: `${CHANGE}/${PROPOSAL_DESIGN_FILE}`, text: "## Key files\n\n| `scripts/src/first.ts` | a file |\n" },
      {
        path: `${CHANGE}/${PROPOSAL_METADATA_FILE}`,
        text: 'x-needs: [game-install]\nx-phase: 3\nx-touches: ["apps/web/**"]\nx-waiting: "namecard art"\n',
      },
      { path: `${CHANGE}/${PROPOSAL_TASKS_FILE}`, text: "- [ ] 1.1 [phase 1] text\n- [ ] 1.2 text\n" },
    ];

    expect(readProposalEntries(files)).toStrictEqual([
      {
        area: "genshin",
        id: "genshin-first",
        kind: FleetEntryKind.Unit,
        lane: "",
        line: "",
        needs: ["game-install"],
        phase: 1,
        touches: ["scripts/src/first.ts", "apps/web/**"],
        waiting: "namecard art",
      },
    ]);
  });

  test("A unit's entry keeps the cheapest-first order the report lists proposals in", () => {
    expect.hasAssertions();

    const files: QueueFile[] = [
      {
        path: `${PROPOSALS_DIRECTORY}/genshin-costly/${PROPOSAL_DESIGN_FILE}`,
        text: "## Key files\n\n| `scripts/src/a.ts` | a |\n| `scripts/src/b.ts` | b |\n",
      },
      {
        path: `${PROPOSALS_DIRECTORY}/genshin-cheap/${PROPOSAL_DESIGN_FILE}`,
        text: "## Key files\n\n| `scripts/src/c.ts` | c |\n",
      },
    ];

    expect(readProposalEntries(files).map(({ id }) => id)).toStrictEqual(["genshin-cheap", "genshin-costly"]);
  });
});
