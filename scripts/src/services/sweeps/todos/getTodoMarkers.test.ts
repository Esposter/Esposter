import { getTodoMarkers } from "#src/services/sweeps/todos/getTodoMarkers";
import { describe, expect, test } from "vitest";

describe(getTodoMarkers, () => {
  test("reads the link a marker is followed by", () => {
    expect.hasAssertions();

    expect(getTodoMarkers("// @TODO: https://a — b")).toStrictEqual([{ isUnfiled: false, line: 1, url: "https://a" }]);
  });

  test("reads a marker that says no upstream issue exists yet as unfiled", () => {
    expect.hasAssertions();

    expect(getTodoMarkers("// @TODO: no upstream issue")).toStrictEqual([{ isUnfiled: true, line: 1, url: "" }]);
  });

  // A scan that reports nothing reads exactly like a clean tree, so the first thing it owes is a planted violation
  // It does report
  test("reads no link for a marker naming a condition", () => {
    expect.hasAssertions();

    expect(getTodoMarkers("// @TODO: a")).toStrictEqual([{ isUnfiled: false, line: 1, url: "" }]);
  });

  test("reads no link for a marker the link sits behind rather than after", () => {
    expect.hasAssertions();

    expect(getTodoMarkers("// @TODO: see https://a")).toStrictEqual([{ isUnfiled: false, line: 1, url: "" }]);
  });

  test("reads each marker on a line holding two", () => {
    expect.hasAssertions();

    expect(getTodoMarkers("<!-- @TODO: https://a --> @TODO:")).toStrictEqual([
      { isUnfiled: false, line: 1, url: "https://a" },
      { isUnfiled: false, line: 1, url: "" },
    ]);
  });

  test("counts the line from the newlines before the marker", () => {
    expect.hasAssertions();

    expect(getTodoMarkers("\n\n# @TODO")).toStrictEqual([{ isUnfiled: false, line: 3, url: "" }]);
  });
});
