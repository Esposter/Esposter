// @vitest-environment happy-dom
import { DocsSectionGroupsMap } from "@/services/docs/DocsSectionGroupsMap";
import { takeOne } from "@esposter/shared";
import mermaid from "mermaid";
import { existsSync } from "node:fs";
import { glob, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const MERMAID_REGEX = /```mermaid\r?\n(?<code>[\s\S]*?)```/gu;
const DOCS_LINK_REGEX = /\]\((?<target>\/docs[^)\s#]*)(?:#[^)\s]*)?\)/gu;
const BACKTICKED_TOKEN_REGEX = /`(?<token>[^`]+)`/gu;
const TABLE_ROW_REGEX = /^\s*\|/u;
const KEY_FILES_HEADER_REGEX = /\bfiles?\b/iu;
// A path token we can resolve, i.e. no glob, placeholder or prose — brackets are Nuxt route segments.
const REPOSITORY_PATH_REGEX = /^[\w./[\]-]+$/u;
// Real /docs routes that are not content pages — the api section is generated TypeDoc output.
const ALLOWED_LINK_TARGETS = ["/docs/api"];
// Path prefixes a Key Files cell may use relative to `packages/app` instead of the repo root.
const APP_RELATIVE_PREFIXES = ["app/", "configuration/", "content/", "public/", "scripts/", "server/", "shared/"];
// Pages every section owns that the sidebar map never lists — they trail in an automatic Planning group.
const UNMAPPED_PAGES = new Set(["index", "roadmap"]);
const PLANNING_DIRECTORIES = new Set(["deferred", "rejected"]);
const contentDirectory = import.meta.dirname;
const docsDirectory = join(contentDirectory, "docs");
const appDirectory = join(contentDirectory, "..");
const repositoryDirectory = join(appDirectory, "..", "..");
const pagePaths = (await Array.fromAsync(glob("**/*.md", { cwd: docsDirectory }))).map((pagePath) =>
  pagePath.replaceAll("\\", "/"),
);
const pages = await Promise.all(
  pagePaths.map(async (page) => ({ markdown: await readFile(join(docsDirectory, page), "utf8"), page })),
);
const skillsDirectory = join(repositoryDirectory, ".claude", "skills");
const skillPagePaths = (await Array.fromAsync(glob("**/*.md", { cwd: skillsDirectory }))).map((pagePath) =>
  pagePath.replaceAll("\\", "/"),
);
const skillPages = await Promise.all(
  skillPagePaths.map(async (page) => ({
    markdown: await readFile(join(skillsDirectory, page), "utf8"),
    page: `.claude/skills/${page}`,
  })),
);
// A token is a path when its first segment names something at the repo root or it carries an app-relative
// Prefix — which keeps the hundreds of identifier tokens in the same tables (`useQuery`, `--no-cache`,
// `/all`) out of the check. `scripts/` lives under both roots, so a path is resolved against either.
const repositoryEntryNames = new Set(await readdir(repositoryDirectory));
const getIsRepositoryPath = (token: string) =>
  REPOSITORY_PATH_REGEX.test(token) &&
  (repositoryEntryNames.has(takeOne(token.split("/"), 0)) ||
    APP_RELATIVE_PREFIXES.some((prefix) => token.startsWith(prefix)));
const getIsPage = (slugPath: string) =>
  existsSync(join(docsDirectory, `${slugPath}.md`)) || existsSync(join(docsDirectory, slugPath, "index.md"));

describe(mermaid.parse, () => {
  // Skills are checked here too, rather than in a test of their own: a skill diagram has no renderer to fail
  // In front of anyone — nothing loads a skill and draws it — so an unparseable one is invisible until an
  // Agent reads a broken picture as the process. This is the only place the parser is already wired up
  const diagrams = [...pages, ...skillPages].flatMap(({ markdown, page }) =>
    [...markdown.matchAll(MERMAID_REGEX)].map((match, index) => ({
      code: match.groups?.code ?? "",
      ordinal: index + 1,
      page,
    })),
  );

  test.each(diagrams)("$page diagram $ordinal parses", async ({ code }) => {
    expect.hasAssertions();

    await expect(mermaid.parse(code)).resolves.toBeDefined();
  });
});

describe("docsLinks", () => {
  test("every /docs link resolves to a page", () => {
    expect.hasAssertions();

    const brokenLinks = pages
      .flatMap(({ markdown, page }) =>
        [...markdown.matchAll(DOCS_LINK_REGEX)].map((match) => ({ page, target: match.groups?.target ?? "" })),
      )
      .filter(
        ({ target }) =>
          !ALLOWED_LINK_TARGETS.some((allowed) => target === allowed || target.startsWith(`${allowed}/`)) &&
          !getIsPage(target.replace(/^\/docs\/?/u, "").replace(/\/$/u, "")),
      )
      .map(({ page, target }) => `${page} → ${target}`);

    expect(brokenLinks).toStrictEqual([]);
  });
});

describe("docsSectionGroupsMap", () => {
  test("every mapped slug has a page", () => {
    expect.hasAssertions();

    const missingPages = Object.entries(DocsSectionGroupsMap)
      .flatMap(([section, groups]) =>
        Object.entries(groups).flatMap(([group, slugs]) => slugs.map((slug) => ({ group, section, slug }))),
      )
      .filter(({ section, slug }) => !getIsPage(`${section}/${slug}`))
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

describe("keyFiles", () => {
  test("every key files path exists", () => {
    expect.hasAssertions();

    const missingPaths = pages
      .flatMap(({ markdown, page }) => {
        let isKeyFilesTable = false;
        return markdown.split("\n").flatMap((line) => {
          if (!TABLE_ROW_REGEX.test(line)) {
            isKeyFilesTable = false;
            return [];
          } else if (!isKeyFilesTable) {
            isKeyFilesTable = KEY_FILES_HEADER_REGEX.test(line);
            return [];
          }
          return [...line.matchAll(BACKTICKED_TOKEN_REGEX)].map((match) => ({
            page,
            token: match.groups?.token ?? "",
          }));
        });
      })
      .filter(
        ({ token }) =>
          getIsRepositoryPath(token) &&
          !existsSync(join(repositoryDirectory, token)) &&
          !existsSync(join(appDirectory, token)),
      )
      .map(({ page, token }) => `${page} → ${token}`);

    expect(missingPaths).toStrictEqual([]);
  });
});
