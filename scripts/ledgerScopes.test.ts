import { AGENT_DIRECTORY } from "@esposter/configuration";
import { existsSync, readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A ledger's `Scope` is what the standing-resume command in the `sweeps` skill takes, so a pathspec that matches
 * nothing reports no work and reads exactly like a swept tree — the same silence that skill's "prove the scan can
 * fail" rule is about, one level up. Nothing else would notice: a scope is prose to every other tool.
 *
 * Resolved against the working tree rather than against `git ls-files`, because the suite runs inside virrun's
 * overlay, which carries the files and not the repository.
 */
describe("ledgerScopes", () => {
  const repositoryRoot = resolve(import.meta.dirname, "..");
  const LEDGER_ROW_REGEX = /^\| \[(?<ledger>[^\]]+)\]\([^)]+\)\s*\|[^|]*\|[^|]*\|(?<scope>[^|]*)\|$/u;
  const PATHSPEC_REGEX = /`(?<pathspec>[^`]+)`/gu;
  const index = readFileSync(join(repositoryRoot, AGENT_DIRECTORY, "ledgers", "README.md"), "utf8");
  const rows = index
    .split("\n")
    .map((line) => LEDGER_ROW_REGEX.exec(line)?.groups)
    .filter((groups) => groups !== undefined)
    .map(({ ledger, scope }) => ({
      ledger: String(ledger),
      pathspecs: [...String(scope).matchAll(PATHSPEC_REGEX)].map((match) => String(match.groups?.pathspec)),
    }));
  // A git pathspec naming a directory means everything under it, and one carrying no separator matches at any
  // Depth — neither is what a glob reads them as, so the two are answered apart rather than through one pattern.
  const checkIsResolved = async (pathspec: string): Promise<boolean> => {
    if (!pathspec.includes("*")) return existsSync(resolve(repositoryRoot, pathspec));

    const pattern = pathspec.includes("/") ? pathspec : `**/${pathspec}`;
    for await (const _ of glob(pattern, { cwd: repositoryRoot })) return true;
    return false;
  };

  test("every ledger in the index declares one", () => {
    expect.hasAssertions();

    expect(rows.filter(({ pathspecs }) => pathspecs.length === 0)).toStrictEqual([]);
  });

  // The index is the only place a scope is written down, so a row that stops parsing takes its assertions with it
  // Rather than failing — this is what makes the emptiness of that set mean something.
  test("the index carries every ledger", () => {
    expect.hasAssertions();

    expect(rows.length).toBeGreaterThanOrEqual(14);
  });

  test.each(rows)("$ledger resolves every pathspec it declares", async ({ pathspecs }) => {
    expect.hasAssertions();

    const resolutions = await Promise.all(
      pathspecs.map(async (pathspec) => ({ isResolved: await checkIsResolved(pathspec), pathspec })),
    );

    expect(resolutions.filter(({ isResolved }) => !isResolved)).toStrictEqual([]);
  });
});
