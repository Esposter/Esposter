import { getRenamedFromPaths } from "#src/services/coderabbit/exclusions/getRenamedFromPaths";
import { describe, expect, test } from "vitest";

describe(getRenamedFromPaths, () => {
  const oldPath = "a";
  const newPath = "b";

  // Both similarities, because the whole reason the pair is read is the moved file that also repathed its own
  // Imports, which git scores below 100
  test.each(["R100", "R085"])("%s pairs the new path with the one it came from", (status) => {
    expect.hasAssertions();

    expect(getRenamedFromPaths(`${status}\0${oldPath}\0${newPath}\0`)).toStrictEqual(new Map([[newPath, oldPath]]));
  });

  test("has no pair for a path that only changed in place", () => {
    expect.hasAssertions();

    expect(getRenamedFromPaths(`M\0${oldPath}\0`)).toStrictEqual(new Map());
  });

  test("has no pair for an added or a deleted path", () => {
    expect.hasAssertions();

    expect(getRenamedFromPaths(`A\0${newPath}\0D\0${oldPath}\0`)).toStrictEqual(new Map());
  });

  // `-z` is the whole reason to read this format: a path holding one of the bytes it exists to protect —
  // Here a tab, which the tab-delimited format would otherwise misread as a field boundary
  test("pairs paths that hold a byte the tab-delimited format would misparse", () => {
    expect.hasAssertions();

    const oldPathWithTab = "old\tname.ts";
    expect(getRenamedFromPaths(`R100\0${oldPathWithTab}\0${newPath}\0`)).toStrictEqual(
      new Map([[newPath, oldPathWithTab]]),
    );
  });
});
