import { parseProposalMetadata } from "#src/services/fleet/parseProposalMetadata";
import { describe, expect, test } from "vitest";

describe(parseProposalMetadata, () => {
  test("reads the needs, touches and waiting a change's metadata names", () => {
    expect.hasAssertions();

    expect(
      parseProposalMetadata(
        'schema: spec-driven\nx-needs: [game-install, "game-exports"]\nx-touches: [apps/a/*.vue, "apps/b/**"]\nx-waiting: "the namecard art (the other machine)"\n',
      ),
    ).toStrictEqual({
      needs: ["game-install", "game-exports"],
      touches: ["apps/a/*.vue", "apps/b/**"],
      waiting: "the namecard art (the other machine)",
    });
  });

  test("reads a sequence a formatter wrapped over the lines below its key", () => {
    expect.hasAssertions();

    expect(
      parseProposalMetadata('schema: spec-driven\nx-touches:\n  [\n    "apps/a/**",\n    "apps/b/**",\n  ]\n'),
    ).toStrictEqual({ needs: [], touches: ["apps/a/**", "apps/b/**"], waiting: "" });
  });

  test("reads every field as empty when the change names none", () => {
    expect.hasAssertions();

    expect(parseProposalMetadata("schema: spec-driven\n")).toStrictEqual({ needs: [], touches: [], waiting: "" });
  });

  test("rejects a sequence field given as one string, so a mistyped field is not silently empty", () => {
    expect.hasAssertions();

    expect(() => parseProposalMetadata("x-needs: game-install\n")).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "array",
          "code": "invalid_type",
          "path": [
            "x-needs"
          ],
          "message": "Invalid input: expected array, received string"
        }
      ]]
    `);
  });
});
