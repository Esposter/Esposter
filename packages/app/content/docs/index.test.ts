// @vitest-environment happy-dom
import { AGENT_DIRECTORY, DOCS_API_DIRECTORY, DOCS_DIRECTORY } from "@esposter/configuration";
import { takeOne } from "@esposter/shared";
import mermaid from "mermaid";
import { existsSync } from "node:fs";
import { glob, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A path token we can resolve, i.e. no glob, placeholder or prose — brackets are Nuxt route segments.
const REPOSITORY_PATH_REGEX = /^[\w./[\]-]+$/u;
// Real docs routes that are not content pages — the api section is generated TypeDoc output.
const ALLOWED_LINK_TARGETS = [`/${DOCS_API_DIRECTORY}`];
// Path prefixes a Key Files cell may use relative to `packages/app` instead of the repo root.
const APP_RELATIVE_PREFIXES = ["app/", "configuration/", "content/", "public/", "scripts/", "server/", "shared/"];
const docsDirectory = import.meta.dirname;
const appDirectory = join(docsDirectory, "..", "..");
const repositoryDirectory = join(appDirectory, "..", "..");
const pagePaths = (await Array.fromAsync(glob("**/*.md", { cwd: docsDirectory }))).map((pagePath) =>
  pagePath.replaceAll("\\", "/"),
);
const pages = await Promise.all(
  pagePaths.map(async (page) => ({ markdown: await readFile(join(docsDirectory, page), "utf8"), page })),
);
const skillsDirectory = join(repositoryDirectory, AGENT_DIRECTORY, "skills");
const skillPagePaths = (await Array.fromAsync(glob("**/*.md", { cwd: skillsDirectory }))).map((pagePath) =>
  pagePath.replaceAll("\\", "/"),
);
const skillPages = await Promise.all(
  skillPagePaths.map(async (page) => ({
    markdown: await readFile(join(skillsDirectory, page), "utf8"),
    page: `${AGENT_DIRECTORY}/skills/${page}`,
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
  const MERMAID_REGEX = /```mermaid\r?\n(?<code>[\s\S]*?)```/gu;
  const ESCAPED_LINE_BREAK_REGEX = /\\n/u;
  const QUOTE_REGEX = /"/gu;

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

  // A line break inside a label is `<br/>`. A literal backslash-n parses cleanly and draws the two characters
  // Into the box, so the parser above cannot see it and only a reader looking at the rendered page can
  test("no diagram writes a line break as an escape sequence", () => {
    expect.hasAssertions();

    const offenders = diagrams
      .filter(({ code }) => ESCAPED_LINE_BREAK_REGEX.test(code))
      .map(({ ordinal, page }) => `${page} diagram ${ordinal}`);

    expect(offenders).toStrictEqual([]);
  });

  // The other half of the same mistake: a label carried across a real newline parses, because the label simply
  // Swallows it, and then renders as one run-on line. A quote left open at the end of a line is the only tell
  test("no diagram carries a label across a line break", () => {
    expect.hasAssertions();

    const offenders = diagrams
      .filter(({ code }) => code.split("\n").some((line) => (line.match(QUOTE_REGEX)?.length ?? 0) % 2 === 1))
      .map(({ ordinal, page }) => `${page} diagram ${ordinal}`);

    expect(offenders).toStrictEqual([]);
  });
});

describe("docsLinks", () => {
  const DOCS_LINK_REGEX = new RegExp(String.raw`\]\((?<target>/${DOCS_DIRECTORY}[^)\s#]*)(?:#[^)\s]*)?\)`, "gu");
  const DOCS_ROUTE_PREFIX_REGEX = new RegExp(String.raw`^/${DOCS_DIRECTORY}/?`, "u");

  test("every /docs link resolves to a page", () => {
    expect.hasAssertions();

    const brokenLinks = pages
      .flatMap(({ markdown, page }) =>
        [...markdown.matchAll(DOCS_LINK_REGEX)].map((match) => ({ page, target: match.groups?.target ?? "" })),
      )
      .filter(
        ({ target }) =>
          !ALLOWED_LINK_TARGETS.some((allowed) => target === allowed || target.startsWith(`${allowed}/`)) &&
          !getIsPage(target.replace(DOCS_ROUTE_PREFIX_REGEX, "").replace(/\/$/u, "")),
      )
      .map(({ page, target }) => `${page} → ${target}`);

    expect(brokenLinks).toStrictEqual([]);
  });

  // The other direction: a link that resolves says nothing about a page nothing links to. An index is the only
  // Route into its area's pages that a reader browsing the tree has, so one it omits is one nobody finds
  test("every index page links every page beside it", () => {
    expect.hasAssertions();

    const indexPages = pagePaths.filter((page) => page.endsWith("index.md"));
    const unlisted = indexPages
      .flatMap((page) => {
        const directory = page.slice(0, -"index.md".length);
        const listed = new Set(
          [...(pages.find((candidate) => candidate.page === page)?.markdown ?? "").matchAll(DOCS_LINK_REGEX)].map(
            (match) => (match.groups?.target ?? "").replace(/\/$/u, ""),
          ),
        );
        return pagePaths
          .filter(
            (sibling) =>
              sibling.startsWith(directory) &&
              sibling !== page &&
              !sibling
                .slice(directory.length)
                .replace(/\/index\.md$/u, "")
                .includes("/"),
          )
          .map((sibling) => `/${DOCS_DIRECTORY}/${sibling.replace(/(?:\/index)?\.md$/u, "")}`)
          .filter((target) => !listed.has(target))
          .map((target) => `${page} → ${target}`);
      })
      .toSorted();

    expect(unlisted).toStrictEqual([]);
  });
});

describe("keyFiles", () => {
  const BACKTICKED_TOKEN_REGEX = /`(?<token>[^`]+)`/gu;
  const TABLE_ROW_REGEX = /^\s*\|/u;
  const KEY_FILES_HEADER_REGEX = /\bfiles?\b/iu;

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
