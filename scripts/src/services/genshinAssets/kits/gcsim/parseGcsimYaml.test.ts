import { parseGcsimYaml } from "#src/services/genshinAssets/kits/gcsim/parseGcsimYaml";
import { describe, expect, test } from "vitest";

describe(parseGcsimYaml, () => {
  test("refuses a flow collection that is never closed or holds a delimiter where a value starts", () => {
    expect.hasAssertions();

    expect(() => parseGcsimYaml("box: [1:2]")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseGcsimYaml, unreadable flow collection "[1:2]"]`,
    );
    expect(() => parseGcsimYaml("box: [1.2, 3")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseGcsimYaml, unreadable flow collection "[1.2, 3"]`,
    );
    expect(() => parseGcsimYaml("hitlag: { time: 0.03")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseGcsimYaml, unreadable flow collection "{ time: 0.03"]`,
    );
  });

  test("refuses a line the top-level mapping does not consume rather than dropping it", () => {
    expect.hasAssertions();

    expect(() => parseGcsimYaml("a: 1\n b: 2\nc: 3")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseGcsimYaml, unreadable line "b: 2"]`,
    );
  });

  test("folds the lines a plain scalar is wrapped over into it with one space, as YAML does", () => {
    expect.hasAssertions();

    const yaml = [
      "docs:",
      "  issues:",
      "    - Movement must be provided by the user in the action params or by using the `movement` system",
      "      function to generate Nightsoul points.",
    ].join("\n");
    expect(parseGcsimYaml(yaml)).toStrictEqual({
      docs: {
        issues: [
          "Movement must be provided by the user in the action params or by using the `movement` system function to generate Nightsoul points.",
        ],
      },
    });
  });

  test("folds a blank line inside a wrapped plain scalar into a newline, as YAML does", () => {
    expect.hasAssertions();

    expect(parseGcsimYaml("a:\n  x\n\n  y")).toStrictEqual({ a: "x\ny" });
    expect(parseGcsimYaml("a:\n  x\n\n\n  y")).toStrictEqual({ a: "x\n\ny" });
  });

  test("reads a flow collection a blank line folds into as the space it is, not as an empty item", () => {
    expect.hasAssertions();

    expect(parseGcsimYaml("a: [1,\n\n  ]")).toStrictEqual({ a: [1] });
    expect(parseGcsimYaml("a: {x: 1,\n\n  }")).toStrictEqual({ a: { x: 1 } });
  });

  test("folds a plain scalar wrapped over the lines below its key, as Iansan's note is", () => {
    expect.hasAssertions();

    const yaml = [
      "burst:",
      "  note:",
      "    Must use the 'movement' argument on action params or `movement` system function to",
      "    generate Nightsoul points.",
    ].join("\n");
    expect(parseGcsimYaml(yaml)).toStrictEqual({
      burst: {
        note: "Must use the 'movement' argument on action params or `movement` system function to generate Nightsoul points.",
      },
    });
  });

  test("leaves a more indented key below a value as the line it is, refused rather than folded", () => {
    expect.hasAssertions();

    expect(() => parseGcsimYaml("a: 1\n  b: 2")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseGcsimYaml, unreadable line "b: 2"]`,
    );
  });
});
