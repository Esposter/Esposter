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
