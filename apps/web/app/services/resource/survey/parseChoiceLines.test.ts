import { parseChoiceLines } from "@/services/resource/survey/parseChoiceLines";
import { describe, expect, test } from "vitest";

describe("parseChoiceLines", () => {
  test("blank text makes no choices", () => {
    expect.hasAssertions();
    expect(parseChoiceLines(" \n\r\n ")).toStrictEqual([]);
  });

  test("each line is a choice, and the blank lines between them are dropped", () => {
    expect.hasAssertions();
    expect(parseChoiceLines("red\r\n\n green | Green\n")).toStrictEqual([
      { text: "", value: "red" },
      { text: "Green", value: "green" },
    ]);
  });
});
