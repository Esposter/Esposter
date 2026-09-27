import { getProposalShips } from "#src/services/proposals/getProposalShips";
import { describe, expect, test } from "vitest";

describe(getProposalShips, () => {
  const date = new Date(0).toISOString().slice(0, 10);
  const hash = "a";

  test("names each area a commit deleted a proposal from once, and never a refactor or a root page", () => {
    expect.hasAssertions();

    const names = [
      "apps/web/content/docs/proposals/a/b.md",
      "apps/web/content/docs/proposals/a/c/d.md",
      "apps/web/content/docs/proposals/refactors/e.md",
      "apps/web/content/docs/proposals/f.md",
      "apps/web/content/docs/a/g.md",
    ].join("\n");

    expect(getProposalShips(`\u001E${hash}\u001F0\u001F${date}\u001F\n\n${names}\n`)).toStrictEqual([
      { area: "a", date, hash, timestamp: 0 },
    ]);
  });
});
