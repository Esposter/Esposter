import { createColor } from "@/checkDependencies/createColor";
import { padEndVisible } from "@/checkDependencies/padEndVisible";
import { describe, expect, test } from "vitest";

describe(padEndVisible, () => {
  const color = createColor(true);

  test("pads a plain string up to the target visible width", () => {
    expect.hasAssertions();

    expect(padEndVisible("a", 3)).toBe("a  ");
  });

  test("does not pad when the string is already wide enough", () => {
    expect.hasAssertions();

    expect(padEndVisible("ab", 1)).toBe("ab");
  });

  test("pads based on visible width, ignoring ANSI escapes", () => {
    expect.hasAssertions();

    expect(padEndVisible(color.red("a"), 3)).toBe(`${color.red("a")}  `);
  });
});
