import { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";
import { extractMoves } from "#src/services/skills/extract/extractMoves";
import { describe, expect, test } from "vitest";

const readNoPage = () => "";

describe(extractMoves, () => {
  const skill = "skill";
  const read = "Read a";

  test("moves a section with its subsections, leaves the rule in its place and returns the new page's index line", () => {
    expect.hasAssertions();

    const { indexLines, pages, sourceText } = extractMoves(
      {
        moves: [
          {
            index: "- `references/b.md`",
            keep: "c",
            match: "## b",
            page: "b",
            read,
            title: "b",
            type: ExtractMoveType.Section,
          },
        ],
        skill,
      },
      "# a\n\n## b\n\nd\n\n### e\n\nf\n\n## g\n",
      readNoPage,
    );

    expect(sourceText).toBe("# a\n\n## b\n\nc\n\n## g\n");
    expect(indexLines).toStrictEqual(["- `references/b.md`"]);
    expect(pages).toStrictEqual(new Map([["b", "# b\n\nRead a\n\nd\n\n## e\n\nf\n"]]));
  });

  test("ends a bullet at the blank line, and appends to a page that exists under its subheading", () => {
    expect.hasAssertions();

    const { pages, sourceText } = extractMoves(
      { moves: [{ keep: "- c", match: "- b", page: "b", subheading: "d", type: ExtractMoveType.Bullet }], skill },
      "# a\n\n- b\n  e\n\nf\n",
      () => "# b\n\nRead a\n",
    );

    expect(sourceText).toBe("# a\n\n- c\n\nf\n");
    expect(pages).toStrictEqual(new Map([["b", "# b\n\nRead a\n\n## d\n\n- b\n  e\n"]]));
  });

  test("keeps a heading inside a code fence with its section", () => {
    expect.hasAssertions();

    const { pages, sourceText } = extractMoves(
      { moves: [{ match: "## b", page: "b", read, title: "b", type: ExtractMoveType.Section }], skill },
      "# a\n\n## b\n\n```md\n## c\n```\n\n## d\n",
      readNoPage,
    );

    expect(sourceText).toBe("# a\n\n## d\n");
    expect(pages).toStrictEqual(new Map([["b", "# b\n\nRead a\n\n```md\n## c\n```\n"]]));
  });

  test("drops a block without writing it anywhere", () => {
    expect.hasAssertions();

    const { pages, sourceText } = extractMoves(
      { moves: [{ isDropped: true, match: "- b", page: "b", type: ExtractMoveType.Bullet }], skill },
      "# a\n\n- b\n- c\n",
      readNoPage,
    );

    expect(sourceText).toBe("# a\n\n- c\n");
    expect(pages).toStrictEqual(new Map());
  });

  test("refuses a match the skill does not hold", () => {
    expect.hasAssertions();

    expect(() =>
      extractMoves(
        { moves: [{ match: "## b", page: "b", type: ExtractMoveType.Section }], skill },
        "# a\n",
        readNoPage,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getMarkdownBlockRange, no section "## b"]`,
    );
  });

  test("refuses a new page with no read line", () => {
    expect.hasAssertions();

    expect(() =>
      extractMoves(
        { moves: [{ match: "## b", page: "b", title: "b", type: ExtractMoveType.Section }], skill },
        "# a\n\n## b\n\nc\n",
        readNoPage,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: skill, page "b" needs a title, a read line opening "Read " and an index line]`,
    );
  });

  test("refuses a bullet prefix more than one item shares", () => {
    expect.hasAssertions();

    expect(() =>
      extractMoves(
        { moves: [{ isDropped: true, match: "- b", page: "b", type: ExtractMoveType.Bullet }], skill },
        "# a\n\n- b-c\n- b\n",
        readNoPage,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getMarkdownBlockRange, 2 bullets match "- b"]`,
    );
  });

  test("reads no heading inside a fence, and keeps blank lines the move did not join", () => {
    expect.hasAssertions();

    const { pages, sourceText } = extractMoves(
      {
        moves: [{ keep: "c", match: "## b", page: "b", subheading: "d", type: ExtractMoveType.Section }],
        skill,
      },
      "# a\n\n## b\n\n```sh\n## e\n\n\nf\n```\n\n## g\n\n```\nh\n\n\ni\n```\n",
      () => "# b\n\nRead a\n",
    );

    expect(sourceText).toBe("# a\n\n## b\n\nc\n\n## g\n\n```\nh\n\n\ni\n```\n");
    expect(pages).toStrictEqual(new Map([["b", "# b\n\nRead a\n\n## d\n\n```sh\n## e\n\n\nf\n```\n"]]));
  });
});
