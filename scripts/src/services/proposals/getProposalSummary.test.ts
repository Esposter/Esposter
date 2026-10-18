import { ProposalSignal } from "#src/models/proposals/ProposalSignal";
import { getProposalSummary } from "#src/services/proposals/getProposalSummary";
import { describe, expect, test } from "vitest";

describe(getProposalSummary, () => {
  const id = "a-b-c";

  test("counts the Key files rows and reads each signal off their paths", () => {
    expect.hasAssertions();

    const text = `# C\n\nLead.\n\n## Key files\n\n| File | Role |\n| --- | --- |\n| \`apps/web/server/a.ts\` | a |\n| \`packages/db-schema/a.ts\` | a |\n| \`apps/functions/a.ts\` | a |\n| \`apps/web/package.json\` | a |\n\n## Sources\n\n| \`apps/infra/a.ts\` | a |\n`;

    expect(getProposalSummary(id, text, new Set())).toStrictEqual({
      blockerIds: [],
      hasKeyFiles: true,
      id,
      keyFileCount: 4,
      signals: [ProposalSignal.Azure, ProposalSignal.Dependency, ProposalSignal.Schema, ProposalSignal.Server],
    });
  });

  test("reports a design with no Key files table as unsized", () => {
    expect.hasAssertions();

    expect(getProposalSummary(id, "# C\n\nLead.\n", new Set())).toStrictEqual({
      blockerIds: [],
      hasKeyFiles: false,
      id,
      keyFileCount: 0,
      signals: [],
    });
  });

  // The lead names what a proposal waits on; a link further down is a reference, and its program is its umbrella
  test("reads blockers off the lead's links to other open proposals only", () => {
    expect.hasAssertions();

    const blockerId = "a-b-d";
    const text = `# C\n\nAfter [d](../${blockerId}/design.md), under [b](../a-b-program/design.md), beside [e](../a-e/), on [g](../../specs/a/g/design.md).\n\n## Scope\n\n[f](../a-f/design.md)\n`;

    expect(getProposalSummary(id, text, new Set(["a-b-program", "a-f", blockerId])).blockerIds).toStrictEqual([
      blockerId,
    ]);
  });
});
