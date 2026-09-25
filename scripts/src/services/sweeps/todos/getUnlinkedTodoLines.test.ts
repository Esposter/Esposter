import { getUnlinkedTodoLines } from "#src/services/sweeps/todos/getUnlinkedTodoLines";
import { describe, expect, test } from "vitest";

describe(getUnlinkedTodoLines, () => {
  // A scan that reports nothing reads exactly like a clean tree, so the first thing it owes is a planted violation
  // It does report
  test("reports a marker naming a condition rather than a link", () => {
    expect.hasAssertions();

    expect(getUnlinkedTodoLines("// @TODO: a")).toStrictEqual([1]);
  });

  test("reports nothing for a marker a link follows", () => {
    expect.hasAssertions();

    expect(getUnlinkedTodoLines("// @TODO: https://a")).toStrictEqual([]);
  });

  test("reports nothing for a marker that says no upstream issue exists yet", () => {
    expect.hasAssertions();

    expect(getUnlinkedTodoLines("// @TODO: no upstream issue")).toStrictEqual([]);
  });

  test("reports a marker the link sits behind rather than after", () => {
    expect.hasAssertions();

    expect(getUnlinkedTodoLines("// @TODO: see https://a")).toStrictEqual([1]);
  });

  test("reports an unlinked marker on a line beside a linked one", () => {
    expect.hasAssertions();

    expect(getUnlinkedTodoLines("<!-- @TODO: https://a --> @TODO:")).toStrictEqual([1]);
  });

  test("counts the line from the newlines before the marker", () => {
    expect.hasAssertions();

    expect(getUnlinkedTodoLines("\n\n# @TODO")).toStrictEqual([3]);
  });
});
