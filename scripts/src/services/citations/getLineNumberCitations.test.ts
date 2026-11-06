import { getLineNumberCitations } from "#src/services/citations/getLineNumberCitations";
import { describe, expect, test } from "vitest";

describe(getLineNumberCitations, () => {
  const PAGE_PATH = "openspec/specs/genshin/combat/design.md";
  const REPOSITORY_PATHS = new Set([
    "openspec/specs/genshin/genshin-weather/design.md",
    "packages/b.vue",
    "packages/genshin-world/src/services/liyue/constants.ts",
    "scripts/src/a.ts",
    "scripts/src/services/genshinParity/passes/measureMotion.ts",
    "scripts/src/services/genshinText/constants.ts",
  ]);

  test("finds a colon citation of a repository file's line range", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        "The mount is set in `packages/genshin-world/src/services/liyue/constants.ts:44-47`.",
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([{ line: 1, text: "packages/genshin-world/src/services/liyue/constants.ts:44-47" }]);
  });

  test("finds a colon citation whose closing backtick sits before its colon", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        "The mount is set in `packages/genshin-world/src/services/liyue/constants.ts`:44-47.",
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([{ line: 1, text: "packages/genshin-world/src/services/liyue/constants.ts:44-47" }]);
  });

  test("finds a prose citation of the lines of the repository file its sentence names", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        "The shade is read there (`scripts/src/services/genshinParity/passes/measureMotion.ts`, lines 32 and 33).",
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([{ line: 1, text: "lines 32 and 33" }]);
  });

  test("finds a line of a repository page named by a link to it", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        "The weather schedule ([Weather](../genshin-weather/design.md), line 15) is the source.",
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([{ line: 1, text: "line 15" }]);
  });

  test("finds a line that its sentence names by no file", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(PAGE_PATH, 'The roadmap\'s "Region palettes" item (line 281) holds it.', REPOSITORY_PATHS),
    ).toStrictEqual([{ line: 1, text: "line 281" }]);
  });

  test("finds a shorthand line that follows a colon citation of the same file", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        "The two are `scripts/src/services/genshinText/constants.ts:10`, `:11`.",
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([
      { line: 1, text: "scripts/src/services/genshinText/constants.ts:10" },
      { line: 1, text: ":11" },
    ]);
  });

  test("finds no line of a file outside the repository", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        [
          "The page says so (`{data-root}/cache/genshin-wiki/Page_Fatui.json`, wikitext line 13).",
          "The burst is `burst.go` lines 20 and 27 of the pinned gcsim.",
          "Its row is `Category_Lisa_Talents.json` line 1.",
          "The table is `Dump.sql`, lines 3 and 4 of the pinned dump.",
          "The build is `packages/vue-phaserjs/dist/index.js:12`, and the copy is `packages/vue-phaserjs/dist/index.js` line 12.",
          "The mesh is `{data-root}/genshin-parity/extracted/maps/blocks/00/00612967.blk`, lines 641 to 928.",
        ].join("\n"),
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([]);
  });

  test("finds nothing inside a fenced block", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(PAGE_PATH, "```text\n`scripts/src/a.ts` lines 3 to 4\n```", REPOSITORY_PATHS),
    ).toStrictEqual([]);
  });

  test("finds nothing that is a version, a measure or a line of the page itself", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        "The reworded lines 7.1 keep the body's lines 32 units apart.\nThe second line of the table holds the total.",
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([]);
  });

  test("finds each citation on the line it sits on, in reading order", () => {
    expect.hasAssertions();

    expect(
      getLineNumberCitations(
        PAGE_PATH,
        "The first.\n\nSee `scripts/src/a.ts:5`.\nAnd `packages/b.vue`, lines 3 to 4 hold it.",
        REPOSITORY_PATHS,
      ),
    ).toStrictEqual([
      { line: 3, text: "scripts/src/a.ts:5" },
      { line: 4, text: "lines 3 to 4" },
    ]);
  });
});
