import { readTestTitles } from "#src/services/openspec/readTestTitles";
import { describe, expect, test } from "vitest";

describe(readTestTitles, () => {
  test("reads the title of a test, an it and a modified call", () => {
    expect.hasAssertions();

    const source = [
      'test("a rig keeps its pose", () => {});',
      "it('a rig keeps its weight', () => {});",
      "test.skip(`a rig keeps its place`, () => {});",
    ].join("\n");

    expect(readTestTitles(source)).toStrictEqual([
      "a rig keeps its pose",
      "a rig keeps its weight",
      "a rig keeps its place",
    ]);
  });

  test("reads an escaped quote inside a title as the quote", () => {
    expect.hasAssertions();

    expect(readTestTitles(String.raw`test('a rig\'s pose holds', () => {});`)).toStrictEqual(["a rig's pose holds"]);
  });

  test.each([
    ["a table test, whose title is a template", 'test.each([[1]])("holds %s", () => {});'],
    ["a call on another object", 'reporter.test("a rig keeps its pose");'],
    ["a title that is not a literal", "test(title, () => {});"],
  ])("leaves %s alone", (_label, source) => {
    expect.hasAssertions();

    expect(readTestTitles(source)).toStrictEqual([]);
  });
});
