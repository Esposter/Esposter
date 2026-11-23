import { getPathspecFiles } from "#src/services/sweeps/ledgerCoverage/getPathspecFiles";
import { describe, expect, test } from "vitest";

describe(getPathspecFiles, () => {
  const files = ["a/x.ts", "a-old/y.ts", "a/b/z.bench.ts", "a/b/w.ts"];

  test.each([
    [
      "a directory's whole tree, not a folder that only starts with its name",
      ["a"],
      ["a/x.ts", "a/b/z.bench.ts", "a/b/w.ts"],
    ],
    ["a file", ["a/b/w.ts"], ["a/b/w.ts"]],
    ["a glob, which crosses directories", ["*.bench.ts"], ["a/b/z.bench.ts"]],
    ["a list, each pathspec's files", ["a/x.ts", "*.bench.ts"], ["a/x.ts", "a/b/z.bench.ts"]],
    ["the root's whole tree", ["."], files],
  ])("names %s", (_description, pathspecs, expected) => {
    expect.hasAssertions();

    expect(getPathspecFiles(files, pathspecs)).toStrictEqual(expected);
  });

  test("throws on a directory written with a trailing slash, which git lists and the matcher would not", () => {
    expect.hasAssertions();

    expect(() => getPathspecFiles(files, ["a/"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: pathspec a/, uses a pattern getPathspecFiles does not match]`,
    );
  });
});
