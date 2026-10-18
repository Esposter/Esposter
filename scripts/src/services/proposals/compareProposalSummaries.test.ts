import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { ProposalSignal } from "#src/models/proposals/ProposalSignal";
import { compareProposalSummaries } from "#src/services/proposals/compareProposalSummaries";
import { describe, expect, test } from "vitest";

describe(compareProposalSummaries, () => {
  const summary: ProposalSummary = { blockerIds: [], hasKeyFiles: true, id: "a", keyFileCount: 0, signals: [] };

  test("orders sized before unsized, unblocked before blocked, then fewer signals, then fewer files", () => {
    expect.hasAssertions();

    const unsized = { ...summary, hasKeyFiles: false, id: "e" };
    const blocked = { ...summary, blockerIds: ["b"], id: "d" };
    const signalled = { ...summary, id: "c", signals: [ProposalSignal.Server] };
    const larger = { ...summary, id: "b", keyFileCount: 1 };

    expect(
      [unsized, blocked, signalled, larger, summary].toSorted((firstSummary, secondSummary) =>
        compareProposalSummaries(firstSummary, secondSummary),
      ),
    ).toStrictEqual([summary, larger, signalled, blocked, unsized]);
  });
});
