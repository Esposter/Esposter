import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { LEDGER_DIRECTORY } from "#src/services/sweeps/constants";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A ledger's rows are written by hand, sized to what one pass reads, so nothing opens one for a workspace member
 * added after the ledger was — and a member no row names is a tree no sweep reads, which looks exactly like a
 * swept one. The quality ledger's scope is the whole repository, so it is the one every member owes a row to;
 * the other ledgers take their rows from it when a sitting opens them.
 */
describe("ledgerMembers", () => {
  const QUALITY_LEDGER = "quality";

  test("the quality ledger names every workspace member", () => {
    expect.hasAssertions();

    const ledgerDirectory = join(REPOSITORY_ROOT, LEDGER_DIRECTORY, QUALITY_LEDGER);
    const text = readdirSync(ledgerDirectory)
      .map((filename) => readFileSync(join(ledgerDirectory, filename), "utf8"))
      .join("\n");
    // The path up to a separator or the closing backtick, so `packages/db` is not answered by `packages/db-schema`
    const unnamedPackageDirectories = readWorkspacePackageDirectories(REPOSITORY_ROOT).filter(
      (packageDirectory) => !text.includes(`\`${packageDirectory}\``) && !text.includes(`\`${packageDirectory}/`),
    );

    expect(unnamedPackageDirectories).toStrictEqual([]);
  });
});
