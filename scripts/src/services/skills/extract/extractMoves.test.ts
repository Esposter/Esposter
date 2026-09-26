import { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";
import { extractMoves } from "#src/services/skills/extract/extractMoves";
import { describe, expect, test } from "vitest";

describe(extractMoves, () => {
  const skill = "skill";
  const read = "Read a";
  const readNoPage = () => "";

  test("moves a section with its subsections, leaves the rule in its place and indexes the new page", () => {
    expect.hasAssertions();

    const { pages, skillText } = extractMoves(
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

    expect(skillText).toBe("# a\n\n## b\n\nc\n\n## g\n\n## Deep Dives\n\n- `references/b.md`\n");
    expect(pages).toStrictEqual(new Map([["b", "# b\n\nRead a\n\nd\n\n## e\n\nf\n"]]));
  });

  test("ends a bullet at the blank line, and appends to a page that exists under its subheading", () => {
    expect.hasAssertions();

    const { pages, skillText } = extractMoves(
      { moves: [{ keep: "- c", match: "- b", page: "b", subheading: "d", type: ExtractMoveType.Bullet }], skill },
      "# a\n\n- b\n  e\n\nf\n",
      () => "# b\n\nRead a\n",
    );

    expect(skillText).toBe("# a\n\n- c\n\nf\n");
    expect(pages).toStrictEqual(new Map([["b", "# b\n\nRead a\n\n## d\n\n- b\n  e\n"]]));
  });

  test("drops a block without writing it anywhere", () => {
    expect.hasAssertions();

    const { pages, skillText } = extractMoves(
      { moves: [{ isDropped: true, match: "- b", page: "b", type: ExtractMoveType.Bullet }], skill },
      "# a\n\n- b\n- c\n",
      readNoPage,
    );

    expect(skillText).toBe("# a\n\n- c\n");
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
      `[InvalidOperationError: Invalid operation: Create, name: skill, page "b" needs a title and a read line opening "Read "]`,
    );
  });
});
