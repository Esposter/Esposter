// @vitest-environment happy-dom
import { APP_RELATIVE_PREFIXES, DOCS_API_DIRECTORY, DOCS_DIRECTORY } from "@esposter/configuration";
import { readHandWrittenPages } from "@@/content/docs/readHandWrittenPages.test";
import { takeOne } from "@esposter/shared";
import mermaid from "mermaid";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const docsDirectory = import.meta.dirname;
const appDirectory = join(docsDirectory, "..", "..");
const repositoryDirectory = join(appDirectory, "..", "..");
const handWrittenPages = await readHandWrittenPages();
// The docs site's own pages, under their path inside it, which is what its links and indexes are written against
const docsPathPrefix = `apps/web/content/${DOCS_DIRECTORY}/`;
const pages = handWrittenPages
  .filter(({ path }) => path.startsWith(docsPathPrefix))
  .map(({ markdown, path }) => ({ markdown, page: path.slice(docsPathPrefix.length) }));
const pagePaths = pages.map(({ page }) => page);
const repositoryEntryNames = new Set(await readdir(repositoryDirectory));
const checkIsPage = (slugPath: string) =>
  existsSync(join(docsDirectory, `${slugPath}.md`)) || existsSync(join(docsDirectory, slugPath, "index.md"));

describe(mermaid.parse, () => {
  const MERMAID_REGEX = /```mermaid\r?\n(?<code>[\s\S]*?)```/gu;
  const ESCAPED_LINE_BREAK_REGEX = /\\n/u;
  const QUOTE_REGEX = /"/gu;
  const LABEL_REGEX = /"(?<label>[^"]*)"/gu;
  // A label is a name plus at most one qualifier. Past these it is a catalog entry or the paragraph the page
  // Owes, and both belong outside the box (`docs` skill, `references/diagrams.md`)
  const MAX_LABEL_LENGTH = 90;
  const MAX_LABEL_LINE_BREAKS = 2;

  // Every hand-written page is checked, not only the docs site's: a skill diagram has no renderer to fail in front of
  // Anyone — nothing loads a skill and draws it — so an unparseable one is invisible until an agent reads a broken
  // Picture as the process, and a README's is drawn by GitHub alone. This is the only place the parser is wired up
  const diagrams = handWrittenPages.flatMap(({ markdown, path: page }) =>
    Array.from(markdown.matchAll(MERMAID_REGEX), (match, index) => ({
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

  // The only half of "a diagram carries a mechanism" a pattern can see. What it cannot — a diagram that is a
  // Catalog, an inventory or a straight line — stays a reading pass, tracked by the docs ledger
  test("no diagram label outgrows a name and one qualifier", () => {
    expect.hasAssertions();

    const offenders = diagrams.flatMap(({ code, ordinal, page }) =>
      Array.from(code.matchAll(LABEL_REGEX), ({ groups }) => groups?.label ?? "")
        .filter((label) => label.length > MAX_LABEL_LENGTH || label.split("<br/>").length > MAX_LABEL_LINE_BREAKS + 1)
        .map((label) => `${page} diagram ${ordinal}: ${label}`),
    );

    expect(offenders).toStrictEqual([]);
  });
});

describe("docsLinks", () => {
  const DOCS_LINK_REGEX = new RegExp(String.raw`\]\((?<target>/${DOCS_DIRECTORY}[^)\s#]*)(?:#[^)\s]*)?\)`, "gu");
  const DOCS_ROUTE_PREFIX_REGEX = new RegExp(String.raw`^/${DOCS_DIRECTORY}/?`, "u");
  // Real docs routes that are not content pages — the api section is generated TypeDoc output.
  const ALLOWED_LINK_TARGETS = [`/${DOCS_API_DIRECTORY}`];

  test("every /docs link resolves to a page", () => {
    expect.hasAssertions();

    const brokenLinks = pages
      .flatMap(({ markdown, page }) =>
        Array.from(markdown.matchAll(DOCS_LINK_REGEX), (match) => ({ page, target: match.groups?.target ?? "" })),
      )
      .filter(
        ({ target }) =>
          !ALLOWED_LINK_TARGETS.some((allowed) => target === allowed || target.startsWith(`${allowed}/`)) &&
          !checkIsPage(target.replace(DOCS_ROUTE_PREFIX_REGEX, "").replace(/\/$/u, "")),
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
          Array.from(
            (pages.find((candidate) => candidate.page === page)?.markdown ?? "").matchAll(DOCS_LINK_REGEX),
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
  // A path token we can resolve, i.e. no glob, placeholder or prose — brackets are Nuxt route segments.
  const REPOSITORY_PATH_REGEX = /^[\w./[\]-]+$/u;
  // A token is a path when its first segment names something at the repo root or it carries an app-relative
  // Prefix — which keeps the hundreds of identifier tokens in the same tables (`useQuery`, `--no-cache`,
  // `/all`) out of the check. `scripts/` lives under both roots, so a path is resolved against either.
  const checkIsRepositoryPath = (token: string) =>
    REPOSITORY_PATH_REGEX.test(token) &&
    (repositoryEntryNames.has(takeOne(token.split("/"), 0)) ||
      APP_RELATIVE_PREFIXES.some((prefix) => token.startsWith(prefix)));

  test("every key files path exists", () => {
    expect.hasAssertions();

    const missingPaths = pages
      .flatMap(({ markdown, page }) => {
        let isKeyFilesTable = false;
        return markdown.split("\n").flatMap((line) => {
          if (!TABLE_ROW_REGEX.test(line)) {
            isKeyFilesTable = false;
            return [];
          } else if (isKeyFilesTable)
            return Array.from(line.matchAll(BACKTICKED_TOKEN_REGEX), (match) => ({
              page,
              token: match.groups?.token ?? "",
            }));
          else {
            isKeyFilesTable = KEY_FILES_HEADER_REGEX.test(line);
            return [];
          }
        });
      })
      .filter(
        ({ token }) =>
          checkIsRepositoryPath(token) &&
          !existsSync(join(repositoryDirectory, token)) &&
          !existsSync(join(appDirectory, token)),
      )
      .map(({ page, token }) => `${page} → ${token}`);

    expect(missingPaths).toStrictEqual([]);
  });
});

describe("proposalModel", () => {
  const PROPOSALS_DIRECTORY = "proposals/";
  const FRONTMATTER_REGEX = /^---\r?\n(?<frontmatter>.*?)\r?\n---/su;
  const MODEL_REGEX = /^model: claude-[\d.a-z-]+$/mu;

  // A spec is executed cold later and weighed by who designed it, which git cannot say (`docs` skill,
  // "Frontmatter"). The area index lists proposals and is not one
  test("every proposal names the model that wrote it", () => {
    expect.hasAssertions();

    const unnamed = pages
      .filter(
        ({ markdown, page }) =>
          page.startsWith(PROPOSALS_DIRECTORY) &&
          page !== `${PROPOSALS_DIRECTORY}index.md` &&
          !MODEL_REGEX.test(FRONTMATTER_REGEX.exec(markdown)?.groups?.frontmatter ?? ""),
      )
      .map(({ page }) => page);

    expect(unnamed).toStrictEqual([]);
  });
});
