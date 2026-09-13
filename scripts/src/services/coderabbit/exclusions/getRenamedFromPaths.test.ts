import { getRenamedFromPaths } from "#src/services/coderabbit/exclusions/getRenamedFromPaths";
import { describe, expect, test } from "vitest";

describe(getRenamedFromPaths, () => {
  const oldPath = "a";
  const newPath = "b";

  // Both similarities, because the whole reason the pair is read is the moved file that also repathed its own
  // Imports, which git scores below 100
  test.each(["R100", "R085"])("%s pairs the new path with the one it came from", (status) => {
    expect.hasAssertions();

    expect(getRenamedFromPaths(`${status}\t${oldPath}\t${newPath}`)).toStrictEqual(new Map([[newPath, oldPath]]));
  });

  test("has no pair for a path that only changed in place", () => {
    expect.hasAssertions();

    expect(getRenamedFromPaths(`M\t${oldPath}`)).toStrictEqual(new Map());
  });

  test("has no pair for an added or a deleted path", () => {
    expect.hasAssertions();

    expect(getRenamedFromPaths(`A\t${newPath}\nD\t${oldPath}`)).toStrictEqual(new Map());
  });
});
