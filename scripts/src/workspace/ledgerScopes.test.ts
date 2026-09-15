import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { AGENT_DIRECTORY } from "@esposter/configuration";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

// A git pathspec naming a directory means everything under it, so a plain path that exists resolves whatever
// Sits inside it; one carrying no separator matches at any depth, which a glob only reads that way once it is
// Prefixed. Neither is what a bare glob would do with it, hence the two steps rather than one pattern.
const checkIsResolved = async (pathspec: string): Promise<boolean> => {
  if (existsSync(resolve(REPOSITORY_ROOT, pathspec))) return true;

  const pattern = pathspec.includes("/") ? pathspec : `**/${pathspec}`;
  for await (const _ of glob(pattern, { cwd: REPOSITORY_ROOT })) return true;
  return false;
};

/**
 * A ledger's `Scope` is what the standing-resume command in the `sweeps` skill takes, so a pathspec that matches
 * nothing reports no work and reads exactly like a swept tree — the same silence that skill's "prove the scan can
 * fail" rule is about, one level up. Nothing else would notice: a scope is prose to every other tool.
 *
 * Resolved against the working tree rather than against `git ls-files`, because the suite runs inside virrun's
 * overlay, which carries the files and not the repository.
 */
describe("ledgerScopes", () => {
  const LEDGER_ROW_REGEX = /^\| \[(?<ledger>[^\]]+)\]\([^)]+\)\s*\|[^|]*\|[^|]*\|(?<scope>[^|]*)\|$/u;
  const MARKDOWN_EXTENSION_REGEX = /\.md$/u;
  const PATHSPEC_REGEX = /`(?<pathspec>[^`]+)`/gu;
  const ledgerDirectory = join(REPOSITORY_ROOT, AGENT_DIRECTORY, "ledgers");
  const index = readFileSync(join(ledgerDirectory, "README.md"), "utf8");
  // A ledger is either one file or a promoted folder of area files, so both shapes are a name the index owes a
  // Row to — the folder's own README is its metadata, not a ledger of its own.
  const ledgers = readdirSync(ledgerDirectory, { withFileTypes: true })
    .filter((entry) => entry.name !== "README.md")
    .map((entry) => (entry.isDirectory() ? entry.name : entry.name.replace(MARKDOWN_EXTENSION_REGEX, "")));
  const rows = index
    .split("\n")
    .map((line) => LEDGER_ROW_REGEX.exec(line)?.groups)
    .filter((groups) => groups !== undefined)
    .map(({ ledger, scope }) => ({
      ledger: String(ledger),
      pathspecs: Array.from(String(scope).matchAll(PATHSPEC_REGEX), (match) => String(match.groups?.pathspec)),
    }));

  test("every ledger in the index declares one", () => {
    expect.hasAssertions();

    expect(rows.filter(({ pathspecs }) => pathspecs.length === 0)).toStrictEqual([]);
  });

  // The index is the only place a scope is written down, so a row that stops parsing takes its assertions with it
  // Rather than failing — this is what makes the emptiness of these sets mean something. Counted off the directory
  // Rather than against a number written here, so adding a ledger and forgetting its row is what fails, and the
  // Check needs nothing done to it when one is added or retired. Both directions, because a row that outlives the
  // Ledger it names points a resume at a file that is not there, which reads as a swept tree like every other
  // Silence.
  test("the index and the ledger directory name the same set", () => {
    expect.hasAssertions();

    expect(ledgers.filter((ledger) => !rows.some(({ ledger: row }) => row === ledger))).toStrictEqual([]);
    expect(rows.filter(({ ledger }) => !ledgers.includes(ledger))).toStrictEqual([]);
  });

  test.each(rows)("$ledger resolves every pathspec it declares", async ({ pathspecs }) => {
    expect.hasAssertions();

    const resolutions = await Promise.all(
      pathspecs.map(async (pathspec) => ({ isResolved: await checkIsResolved(pathspec), pathspec })),
    );

    expect(resolutions.filter(({ isResolved }) => !isResolved)).toStrictEqual([]);
  });
});
