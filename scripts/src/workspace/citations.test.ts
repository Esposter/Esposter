import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";
import { readCitingPages } from "#src/services/citations/readCitingPages";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import {
  AGENT_DIRECTORY,
  AGENT_WORKTREES_DIRECTORY,
  APP_RELATIVE_PREFIXES,
  DOCS_API_DIRECTORY,
} from "@esposter/configuration";
import { takeOne } from "@esposter/shared";
import { existsSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A skill, a ledger, a docs page or a README cites code by its repo-relative path in backticks and a skill by
 * its name, and nothing resolves either: `ai:citations:sync` rewrites the citations a rename reports, but a
 * directory whose children moved to different roots is never a rename, and a row copied from an older tree is
 * not one either. A path that resolves nowhere reads exactly like one that does, which is the silence the docs
 * suite's Key Files check already refuses for its tables — this is the same check over every backticked path
 * in the trees the sync rewrites. Two routes are exempt because neither is a source path a rename could carry:
 * the worktrees directory, which is machine-local and gitignored, and TypeDoc's output under the app's `public/`,
 * which is a deployment artifact that exists only once `typedoc` has run.
 */
describe("citations", () => {
  // A path token we can resolve, i.e. no glob placeholder, line number or prose — brackets are Nuxt route segments.
  const REPOSITORY_PATH_REGEX = /^[\w./[\]*-]+$/u;
  const SKILL_CITATION_REGEX = /`(?<name>[\w-]+)` skill\b/gu;
  const appDirectory = join(REPOSITORY_ROOT, "apps", "web");
  const skillsDirectory = join(REPOSITORY_ROOT, AGENT_DIRECTORY, "skills");
  // A token is a path when its first segment names something git tracks at the repo root or it carries an
  // App-relative prefix — which keeps the identifier tokens in the same prose (`useQuery`, `--no-cache`) and the
  // Install-time paths (`node_modules/.vite`) out of the check.
  const repositoryEntryNames = new Set(getSweepFilePaths(".").map((path) => takeOne(path.split("/"), 0)));
  const generatedDocsDirectory = `public/${DOCS_API_DIRECTORY}`;
  const checkIsRepositoryPath = (token: string) =>
    REPOSITORY_PATH_REGEX.test(token) &&
    !token.startsWith(AGENT_WORKTREES_DIRECTORY) &&
    !token.includes(generatedDocsDirectory) &&
    (repositoryEntryNames.has(takeOne(token.split("/"), 0)) ||
      APP_RELATIVE_PREFIXES.some((prefix) => token.startsWith(prefix)));
  // A ledger unit may be a glob (`apps/infra/src/*`) or a module named without its extension so the row covers the
  // File and its test (`server/trpc/routers/resource`), so a lookup that misses falls through to a match
  const checkIsResolved = async (token: string): Promise<boolean> => {
    for (const cwd of [REPOSITORY_ROOT, appDirectory]) {
      if (existsSync(join(cwd, token))) return true;
      for await (const _match of glob([token, `${token}.*`], { cwd })) return true;
    }
    return false;
  };
  const pages = readCitingPages();

  test("every cited path exists", async () => {
    expect.hasAssertions();

    const citations = pages.flatMap(({ path, text }) =>
      getBacktickedTokens(text)
        .filter((token) => checkIsRepositoryPath(token))
        .map((token) => ({ page: path, token })),
    );
    const resolutions = await Promise.all(
      citations.map(async ({ page, token }) => ({ isResolved: await checkIsResolved(token), page, token })),
    );

    expect(
      resolutions.filter(({ isResolved }) => !isResolved).map(({ page, token }) => `${page} → ${token}`),
    ).toStrictEqual([]);
  });

  test("every cited skill exists", () => {
    expect.hasAssertions();

    expect(
      pages
        .flatMap(({ path, text }) =>
          Array.from(text.matchAll(SKILL_CITATION_REGEX), (match) => ({
            name: match.groups?.name ?? "",
            page: path,
          })),
        )
        .filter(({ name }) => !existsSync(join(skillsDirectory, name)))
        .map(({ name, page }) => `${page} → ${name}`),
    ).toStrictEqual([]);
  });
});
