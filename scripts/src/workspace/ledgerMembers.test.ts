import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { LEDGER_AREA_DIRECTORY } from "#src/services/sweeps/constants";
import { getUnnamedMemberPaths } from "#src/services/workspace/getUnnamedMemberPaths";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The area list's units are written by hand, sized to what one pass reads, so nothing opens one for a workspace
 * member added after the list was — and a member no unit names is a tree no question reads, which looks exactly like
 * a swept one. Every file-based question takes its cells from that list, so it is the list every member owes a unit to.
 */
describe("ledgerMembers", () => {
  test("the area list names every workspace member", () => {
    expect.hasAssertions();

    const ledgerDirectory = join(REPOSITORY_ROOT, LEDGER_AREA_DIRECTORY);
    const text = readdirSync(ledgerDirectory)
      .map((filename) => readFileSync(join(ledgerDirectory, filename), "utf8"))
      .join("\n");
    const unnamedPackageDirectories = getUnnamedMemberPaths(text, readWorkspacePackageDirectories(REPOSITORY_ROOT));

    expect(unnamedPackageDirectories).toStrictEqual([]);
  });
});
