import { splitGameTextColors } from "#src/services/splitGameTextColors";
import { describe, expect, test } from "vitest";

describe(splitGameTextColors, () => {
  test("a string with no colour tag is one plain run", () => {
    expect.hasAssertions();

    expect(splitGameTextColors("Lower")).toStrictEqual([{ text: "Lower" }]);
  });

  test("each coloured run keeps its colour, between the plain runs around it", () => {
    expect.hasAssertions();

    expect(splitGameTextColors("to <color=#F39000FF>24</color> hours")).toStrictEqual([
      { text: "to " },
      { color: "#F39000FF", text: "24" },
      { text: " hours" },
    ]);
  });

  test("a tag at the start and the end leaves no empty run", () => {
    expect.hasAssertions();

    expect(splitGameTextColors("<color=#F39000FF>1</color><color=#F39000FF>2</color>")).toStrictEqual([
      { color: "#F39000FF", text: "1" },
      { color: "#F39000FF", text: "2" },
    ]);
  });
});
