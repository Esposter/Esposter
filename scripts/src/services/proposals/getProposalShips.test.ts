import { getProposalShips } from "#src/services/proposals/getProposalShips";
import { describe, expect, test } from "vitest";

describe(getProposalShips, () => {
  const date = new Date(0).toISOString().slice(0, 10);
  const hash = "a";

  test("names each area a commit deleted a change from once, and never a refactor or the archive", () => {
    expect.hasAssertions();

    const names = [
      "openspec/changes/a-b/design.md",
      "openspec/changes/a-c-d/tasks.md",
      "openspec/changes/refactors-e/design.md",
      `openspec/changes/archive/${date}-f-g/design.md`,
      "openspec/specs/h/design.md",
    ].join("\n");

    expect(getProposalShips(`\u001E${hash}\u001F0\u001F${date}\u001F\n\n${names}\n`)).toStrictEqual([
      { area: "a", date, hash, timestamp: 0 },
    ]);
  });
});
