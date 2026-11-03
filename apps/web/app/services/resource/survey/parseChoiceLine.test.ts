import { parseChoiceLine } from "@/services/resource/survey/parseChoiceLine";
import { describe, expect, test } from "vitest";

describe("parseChoiceLine", () => {
  test("a line without a bar is its value, with no text", () => {
    expect.hasAssertions();
    expect(parseChoiceLine(" red ")).toStrictEqual({ text: "", value: "red" });
  });

  test("a line with a bar is its value and the text after the bar", () => {
    expect.hasAssertions();
    expect(parseChoiceLine("red | Red colour")).toStrictEqual({ text: "Red colour", value: "red" });
  });
});
