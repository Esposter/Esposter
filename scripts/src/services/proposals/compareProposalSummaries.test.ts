import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { ProposalSignal } from "#src/models/proposals/ProposalSignal";
import { compareProposalSummaries } from "#src/services/proposals/compareProposalSummaries";
import { describe, expect, test } from "vitest";

describe(compareProposalSummaries, () => {
  const summary: ProposalSummary = {
    blockerRoutes: [],
    hasKeyFiles: true,
    keyFileCount: 0,
    path: "a",
    route: "/a",
    signals: [],
  };

  test("orders sized before unsized, unblocked before blocked, then fewer signals, then fewer files", () => {
    expect.hasAssertions();

    const unsized = { ...summary, hasKeyFiles: false, path: "e" };
    const blocked = { ...summary, blockerRoutes: ["/b"], path: "d" };
    const signalled = { ...summary, path: "c", signals: [ProposalSignal.Server] };
    const larger = { ...summary, keyFileCount: 1, path: "b" };

    expect(
      [unsized, blocked, signalled, larger, summary].toSorted((firstSummary, secondSummary) =>
        compareProposalSummaries(firstSummary, secondSummary),
      ),
    ).toStrictEqual([summary, larger, signalled, blocked, unsized]);
  });
});
