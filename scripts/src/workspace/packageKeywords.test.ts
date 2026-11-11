import { GITHUB_ISSUES_URL } from "#src/services/package/new/constants";
import { getPackageHomepage } from "#src/services/package/new/getPackageHomepage";
import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { SITE_NAME } from "@esposter/shared";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const readKeywords = (manifest: Record<string, unknown>): string[] =>
  Array.isArray(manifest.keywords) ? (manifest.keywords as string[]) : [];

/**
 * What a published package says about itself on npm is searched and read by strangers, and the build derives none of it.
 * The part that is derivable is held here: the links the generator writes, and the shape of the keywords, which is what
 * keeps a list from being noise. Which words describe a package stays a judgement, written beside the manifest's
 * description and checked by a reader (`file-organization`, `references/new-package.md`).
 */
describe("package keywords", () => {
  // Enough to name what the package is, what it plugs into and what it is for, and few enough that the list does not
  // Drift into the vocabulary around the package
  const KEYWORD_COUNT_RANGE = { maximum: 10, minimum: 5 };
  // One lowercase word or hyphenated phrase, since npm search matches whole tokens and a dotted or cased spelling would
  // Be a second spelling of one word
  const KEYWORD_REGEX = /^[a-z\d]+(?:-[a-z\d]+)*$/u;
  // Words true of every package here or of the repository, so a search for one finds nothing in particular: the
  // Language (npm shows a package's types itself), the registry and the repository
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
  const WORKSPACE_DIRECTORIES = ["apps", "packages"];

  const readManifests = () =>
    [
      ...WORKSPACE_DIRECTORIES.flatMap((directory) =>
        readdirSync(resolve(REPOSITORY_ROOT, directory), { withFileTypes: true })
          .filter(
            (entry) =>
              entry.isDirectory() && existsSync(resolve(REPOSITORY_ROOT, directory, entry.name, PACKAGE_JSON_FILENAME)),
          )
          .map(({ name }) => ({
            directory,
            manifest: readJsonFile(resolve(REPOSITORY_ROOT, directory, name, PACKAGE_JSON_FILENAME)),
            name,
          })),
      ),
      {
        directory: "",
        manifest: readJsonFile(resolve(REPOSITORY_ROOT, "scripts", PACKAGE_JSON_FILENAME)),
        name: "scripts",
      },
    ].map((entry) => ({ ...entry, isPrivate: entry.manifest.private === true }));
  const MANIFESTS = readManifests();
  const PUBLISHED_PACKAGES = MANIFESTS.filter(({ directory, isPrivate }) => directory === "packages" && !isPrivate);
  // Named rather than counted: the package that fails names itself in the failure
  const getFailingNames = (checkIsFailing: (keywords: string[]) => boolean): string[] =>
    PUBLISHED_PACKAGES.filter(({ manifest }) => checkIsFailing(readKeywords(manifest))).map(({ name }) => name);

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

  // Nothing lists a private package, so a list there is a claim no reader sees
  test("are carried by no private workspace package", () => {
    expect.hasAssertions();

    expect(
      MANIFESTS.filter(({ isPrivate, manifest }) => isPrivate && readKeywords(manifest).length > 0).map(
        ({ name }) => name,
      ),
    ).toStrictEqual([]);
  });

  test("link to the package's own page and the repository's issues", () => {
    expect.hasAssertions();

    const failingNames = PUBLISHED_PACKAGES.filter(({ manifest, name }) => {
      const { bugs, homepage } = manifest as { bugs?: { url?: string }; homepage?: string };
      return homepage !== getPackageHomepage(name) || bugs?.url !== GITHUB_ISSUES_URL;
    }).map(({ name }) => name);

    expect(failingNames).toStrictEqual([]);
  });
});
