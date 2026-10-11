import { readTypeBenchSource } from "#src/services/benchTypes/readTypeBenchSource";
import { describe, expect, test } from "vitest";

describe(readTypeBenchSource, () => {
  const FIRST_CASE_TEXT = 'export type FirstCase = Get<Fixture, "id">;';
  const SECOND_CASE_TEXT = ["export type SecondCase = {", '  id: Fixture["id"];', "};"].join("\n");
  const HEADER_LINES = ['import type { Get } from "type-fest";', "", "type Fixture = { id: string };", ""];

  test("exported type aliases are the cases and everything else is the header", () => {
    expect.hasAssertions();

    const source = readTypeBenchSource([...HEADER_LINES, FIRST_CASE_TEXT, SECOND_CASE_TEXT, ""].join("\n"));

    expect(source).toStrictEqual({
      cases: [
        { name: "FirstCase", text: FIRST_CASE_TEXT },
        { name: "SecondCase", text: SECOND_CASE_TEXT },
      ],
      header: [...HEADER_LINES, "", "", ""].join("\n"),
    });
  });

  test("a file with no exported alias has no cases and keeps its whole text as the header", () => {
    expect.hasAssertions();

    const text = HEADER_LINES.join("\n");

    expect(readTypeBenchSource(text)).toStrictEqual({ cases: [], header: text });
  });
});
