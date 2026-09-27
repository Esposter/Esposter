import { ProposalSignal } from "#src/models/proposals/ProposalSignal";
import { getProposalSummary } from "#src/services/proposals/getProposalSummary";
import { describe, expect, test } from "vitest";

describe(getProposalSummary, () => {
  const path = "apps/web/content/docs/proposals/a/b/c.md";
  const route = "/docs/proposals/a/b/c";
  const frontmatter = "---\ntitle: c\n---\n";

  test("counts the Key files rows and reads each signal off their paths", () => {
    expect.hasAssertions();

    const text = `${frontmatter}\nLead.\n\n## Key files\n\n| File | Role |\n| --- | --- |\n| \`apps/web/server/a.ts\` | a |\n| \`packages/db-schema/a.ts\` | a |\n| \`apps/functions/a.ts\` | a |\n| \`apps/web/package.json\` | a |\n\n## Sources\n\n| \`apps/infra/a.ts\` | a |\n`;

    expect(getProposalSummary(path, text, new Set())).toStrictEqual({
      blockerRoutes: [],
      hasKeyFiles: true,
      keyFileCount: 4,
      path,
      route,
      signals: [ProposalSignal.Azure, ProposalSignal.Dependency, ProposalSignal.Schema, ProposalSignal.Server],
    });
  });

  test("reports a page with no Key files table as unsized", () => {
    expect.hasAssertions();

    expect(getProposalSummary(path, `${frontmatter}\nLead.\n`, new Set())).toStrictEqual({
      blockerRoutes: [],
      hasKeyFiles: false,
      keyFileCount: 0,
      path,
      route,
      signals: [],
    });
  });

  // The lead names what a proposal waits on; a link further down is a reference, and the folder index is its umbrella
  test("reads blockers off the lead's links to other open proposals only", () => {
    expect.hasAssertions();

    const blockerRoute = "/docs/proposals/a/b/d";
    const text = `${frontmatter}\nAfter [d](${blockerRoute}), under [b](/docs/proposals/a/b), beside [e](/docs/proposals/a/e).\n\n## Scope\n\n[f](/docs/proposals/a/f)\n`;

    expect(
      getProposalSummary(path, text, new Set(["/docs/proposals/a/b", "/docs/proposals/a/f", blockerRoute]))
        .blockerRoutes,
    ).toStrictEqual([blockerRoute]);
  });
});
