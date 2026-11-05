import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { groupProposalsByPhase } from "#src/services/proposals/groupProposalsByPhase";
import { describe, expect, test } from "vitest";

const createSummary = (overrides: Partial<ProposalSummary>): ProposalSummary => ({
  blockerIds: [],
  hasKeyFiles: true,
  id: "first",
  keyFileCount: 0,
  signals: [],
  ...overrides,
});

describe(groupProposalsByPhase, () => {
  test("lists a heading per phase from 0 to 7 in order, then no phase", () => {
    expect.hasAssertions();

    expect(groupProposalsByPhase([]).map(({ heading }) => heading)).toStrictEqual([
      "Phase 0",
      "Phase 1",
      "Phase 2",
      "Phase 3",
      "Phase 4",
      "Phase 5",
      "Phase 6",
      "Phase 7",
      "No phase",
    ]);
  });

  test("puts each proposal under its phase, keeping the order the proposals are given in", () => {
    expect.hasAssertions();

    const summaries = [
      createSummary({ id: "phase-3-cheapest", phase: 3 }),
      createSummary({ id: "no-phase" }),
      createSummary({ id: "phase-0", phase: 0 }),
      createSummary({ id: "phase-3-next", phase: 3 }),
    ];

    expect(
      groupProposalsByPhase(summaries)
        .filter(({ summaries: group }) => group.length > 0)
        .map(({ heading, summaries: group }) => ({ heading, ids: group.map(({ id }) => id) })),
    ).toStrictEqual([
      { heading: "Phase 0", ids: ["phase-0"] },
      { heading: "Phase 3", ids: ["phase-3-cheapest", "phase-3-next"] },
      { heading: "No phase", ids: ["no-phase"] },
    ]);
  });
});
