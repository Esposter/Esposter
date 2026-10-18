import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readHandWrittenPages } from "#src/workspace/readHandWrittenPages.test";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";

// Every page under `openspec/` links its neighbours by a path relative to itself, which nothing resolves: a moved or
// Renamed capability leaves the link reading exactly like one that works
describe("openspecLinks", () => {
  // A target with a scheme is another site's, and one in angle brackets is read from inside them, since that is how a
  // Target holding a parenthesis is written
  const LINK_REGEX = /\]\(<?(?<target>[^)\s#>]+)(?:#[^)\s]*)?>?\)/gu;
  const SCHEME_REGEX = /^[a-z][\d+.a-z-]*:/iu;
  const OPENSPEC_PATH_PREFIX = "openspec/";

  test("every relative link resolves", { timeout: TREE_READ_TIMEOUT_MS }, async () => {
    expect.hasAssertions();

    const pages = await readHandWrittenPages();
    const brokenLinks = pages
      .filter(({ path }) => path.startsWith(OPENSPEC_PATH_PREFIX))
      .flatMap(({ markdown, path }) =>
        Array.from(markdown.matchAll(LINK_REGEX), (match) => match.groups?.target ?? "")
          .filter((target) => !SCHEME_REGEX.test(target) && !existsSync(join(REPOSITORY_ROOT, dirname(path), target)))
          .map((target) => `${path} → ${target}`),
      )
      .toSorted();

    expect(brokenLinks).toStrictEqual([]);
  });
});
