import { parseProposalFrontmatter } from "#src/services/fleet/parseProposalFrontmatter";
import { describe, expect, test } from "vitest";

describe(parseProposalFrontmatter, () => {
  test("reads the needs, touches and waiting a page's frontmatter names", () => {
    expect.hasAssertions();

    expect(
      parseProposalFrontmatter(
        '---\ntitle: a\nneeds: [game-install, "game-exports"]\ntouches: [apps/a/*.vue, "apps/b/**"]\nwaiting: "the namecard art (the other machine)"\n---\n\nBody.\n',
      ),
    ).toStrictEqual({
      needs: ["game-install", "game-exports"],
      touches: ["apps/a/*.vue", "apps/b/**"],
      waiting: "the namecard art (the other machine)",
    });
  });

  test("reads every field as empty when the page names none", () => {
    expect.hasAssertions();

    expect(parseProposalFrontmatter("---\ntitle: a\n---\n\nBody.\n")).toStrictEqual({
      needs: [],
      touches: [],
      waiting: "",
    });
  });

  test("reads a page with no frontmatter as naming none", () => {
    expect.hasAssertions();

    expect(parseProposalFrontmatter("Body.\n")).toStrictEqual({ needs: [], touches: [], waiting: "" });
  });

  test("rejects a sequence field given as one string, so a mistyped field is not silently empty", () => {
    expect.hasAssertions();

    expect(() => parseProposalFrontmatter("---\nneeds: game-install\n---\n")).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "array",
          "code": "invalid_type",
          "path": [
            "needs"
          ],
          "message": "Invalid input: expected array, received string"
        }
      ]]
    `);
  });
});
