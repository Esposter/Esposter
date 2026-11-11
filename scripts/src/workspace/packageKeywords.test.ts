import { GITHUB_REPOSITORY_URL, PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { SITE_NAME } from "@esposter/shared";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * What a published package says about itself on npm is searched and read by strangers, and the build derives none of it.
 * The part that is derivable is held here: the links the generator writes, and the shape of the keywords, which is what
 * keeps a list from being noise. Which words describe a package stays a judgement, written beside the manifest's
 * description and checked by a reader (`file-organization`, `references/new-package.md`).
 */
// The room a list has to name what the package is, what it plugs into and what it is for, and the room past which a
// List stops naming a package and starts listing the vocabulary near it
const KEYWORD_COUNT_RANGE = { maximum: 10, minimum: 5 };
// One lowercase word or hyphenated phrase: npm search matches whole tokens, so a dotted or cased spelling is a second
// Spelling of one word
const KEYWORD_REGEX = /^[a-z\d]+(?:-[a-z\d]+)*$/u;
// Words true of every package here, or of the repository rather than the package, so a search for them finds nothing
// Distinct: the language every package shares (npm shows a package's types itself), the registry, the repository
const NOISE_KEYWORDS = new Set([
  "javascript",
  "js",
  "monorepo",
  "npm",
  "package",
  "shared",
  SITE_NAME.toLowerCase(),
  "ts",
  "typescript",
]);

describe("package keywords", () => {
  const PUBLISHED_PACKAGES = readdirSync(resolve(REPOSITORY_ROOT, PACKAGES_DIRECTORY), { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(resolve(REPOSITORY_ROOT, PACKAGES_DIRECTORY, entry.name, PACKAGE_JSON_FILENAME)),
    )
    .map(({ name }) => ({
      manifest: readJsonFile(resolve(REPOSITORY_ROOT, PACKAGES_DIRECTORY, name, PACKAGE_JSON_FILENAME)),
      name,
    }))
    .filter(({ manifest }) => manifest.private !== true);
  // Named rather than counted: the package that fails names itself in the failure
  const getFailingNames = (checkIsFailing: (keywords: string[]) => boolean): string[] =>
    PUBLISHED_PACKAGES.filter(({ manifest }) =>
      checkIsFailing(Array.isArray(manifest.keywords) ? (manifest.keywords as string[]) : []),
    ).map(({ name }) => name);

  test("are as many as name a package and no more", () => {
    expect.hasAssertions();

    expect(
      getFailingNames(({ length }) => length < KEYWORD_COUNT_RANGE.minimum || length > KEYWORD_COUNT_RANGE.maximum),
    ).toStrictEqual([]);
  });

  test("are lowercase words and unique", () => {
    expect.hasAssertions();

    expect(
      getFailingNames(
        (keywords) =>
          keywords.some((keyword) => !KEYWORD_REGEX.test(keyword)) || new Set(keywords).size !== keywords.length,
      ),
    ).toStrictEqual([]);
  });

  test("leave out the words every package here would carry", () => {
    expect.hasAssertions();

    expect(getFailingNames((keywords) => keywords.some((keyword) => NOISE_KEYWORDS.has(keyword)))).toStrictEqual([]);
  });

  test("link to the package's own page and the repository's issues", () => {
    expect.hasAssertions();

    const failingNames = PUBLISHED_PACKAGES.filter(({ manifest, name }) => {
      const { bugs, homepage } = manifest as { bugs?: { url?: string }; homepage?: string };
      return (
        homepage !== `${GITHUB_REPOSITORY_URL}/blob/main/${PACKAGES_DIRECTORY}/${name}#readme` ||
        bugs?.url !== `${GITHUB_REPOSITORY_URL}/issues`
      );
    }).map(({ name }) => name);

    expect(failingNames).toStrictEqual([]);
  });
});
