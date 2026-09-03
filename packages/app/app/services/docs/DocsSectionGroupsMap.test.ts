import { DocsSectionGroupsMap } from "@/services/docs/DocsSectionGroupsMap";
import { DOCS_DIRECTORY } from "@esposter/configuration";
import { existsSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

// The map is the sidebar, and it is hand-maintained against a tree nothing links it to — so it is checked in
// Both directions. One way a group points at a page that was renamed or deleted; the other a page ships with
// No way to reach it from the navigation, which is invisible in review because the page itself renders fine
describe("docsSectionGroupsMap", () => {
  // Pages every section owns that the sidebar map never lists — they trail in an automatic Planning group.
  const UNMAPPED_PAGES = new Set(["index", "roadmap"]);
  const PLANNING_DIRECTORIES = new Set(["deferred", "rejected"]);
  const docsDirectory = join(import.meta.dirname, "..", "..", "..", "content", DOCS_DIRECTORY);
  const checkIsPage = (slugPath: string) =>
    existsSync(join(docsDirectory, `${slugPath}.md`)) || existsSync(join(docsDirectory, slugPath, "index.md"));
  let pagePaths: string[] = [];

  beforeAll(async () => {
    pagePaths = (await Array.fromAsync(glob("**/*.md", { cwd: docsDirectory }))).map((pagePath) =>
      pagePath.replaceAll("\\", "/"),
    );
  });

  test("every mapped slug has a page", () => {
    expect.hasAssertions();

    const missingPages = Object.entries(DocsSectionGroupsMap)
      .flatMap(([section, groups]) =>
        Object.entries(groups).flatMap(([group, slugs]) => slugs.map((slug) => ({ group, section, slug }))),
      )
      .filter(({ section, slug }) => !checkIsPage(`${section}/${slug}`))
      .map(({ group, section, slug }) => `${section} → ${group} → ${slug}`);

    expect(missingPages).toStrictEqual([]);
  });

  test("every feature page of a mapped section is registered", () => {
    expect.hasAssertions();

    const unregisteredPages = Object.entries(DocsSectionGroupsMap)
      .flatMap(([section, groups]) => {
        const mappedSlugs = new Set(Object.values(groups).flat());
        return pagePaths
          .filter((page) => page.startsWith(`${section}/`))
          .map((page) => page.slice(`${section}/`.length).replace(/(?:\/index)?\.md$/u, ""))
          .filter(
            (slug) =>
              !slug.includes("/") &&
              !UNMAPPED_PAGES.has(slug) &&
              !PLANNING_DIRECTORIES.has(slug) &&
              !mappedSlugs.has(slug),
          )
          .map((slug) => `${section} → ${slug}`);
      })
      .toSorted();

    expect(unregisteredPages).toStrictEqual([]);
  });
});
