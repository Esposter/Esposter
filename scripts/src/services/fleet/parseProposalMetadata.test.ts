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
      phase: undefined,
      touches: ["apps/a/*.vue", "apps/b/**"],
      waiting: "the namecard art (the other machine)",
    });
  });

  test("reads a sequence a formatter wrapped over the lines below its key", () => {
    expect.hasAssertions();

    expect(
      parseProposalMetadata('schema: spec-driven\nx-touches:\n  [\n    "apps/a/**",\n    "apps/b/**",\n  ]\n'),
    ).toStrictEqual({ needs: [], phase: undefined, touches: ["apps/a/**", "apps/b/**"], waiting: "" });
  });

  test("reads the phase a change names as its integer", () => {
    expect.hasAssertions();

    expect(parseProposalMetadata("schema: spec-driven\nx-phase: 3\n")).toStrictEqual({
      needs: [],
      phase: 3,
      touches: [],
      waiting: "",
    });
  });

  test("reads every field as empty when the change names none, its phase included", () => {
    expect.hasAssertions();

    expect(parseProposalMetadata("schema: spec-driven\n")).toStrictEqual({
      needs: [],
      phase: undefined,
      touches: [],
      waiting: "",
    });
  });

  test("rejects a phase past the last one, so a phase off the list is not silently taken", () => {
    expect.hasAssertions();

    expect(() => parseProposalMetadata("x-phase: 9\n")).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "origin": "number",
          "code": "too_big",
          "maximum": 7,
          "inclusive": true,
          "path": [
            "x-phase"
          ],
          "message": "Too big: expected number to be <=7"
        }
      ]]
    `);
  });

  test("rejects a phase written as a word, so a mistyped phase is not silently absent", () => {
    expect.hasAssertions();

    expect(() => parseProposalMetadata('x-phase: "three"\n')).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "origin": "string",
          "code": "invalid_format",
          "format": "regex",
          "pattern": "/^\\\\d+$/u",
          "path": [
            "x-phase"
          ],
          "message": "Invalid string: must match pattern /^\\\\d+$/u"
        }
      ]]
    `);
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
