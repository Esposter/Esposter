import { getRestatedGameColours } from "#src/services/sweeps/restatedGameColours/getRestatedGameColours";
import { describe, expect, test } from "vitest";

describe(getRestatedGameColours, () => {
  const colourMap = { GAME_CREAM: "#ece5d8" };

  // A scan that reports nothing reads exactly like a clean tree, so it owes a planted violation it does report first
  test("reports a literal the constant already names, with its line, whatever its case", () => {
    expect.hasAssertions();

    expect(getRestatedGameColours(".a {\n  color: #ECE5D8;\n}", colourMap)).toStrictEqual(["2: GAME_CREAM"]);
  });

  test("reports the same colour written as rgb, with commas or spaces, but not a translucent one", () => {
    expect.hasAssertions();

    expect(
      getRestatedGameColours(
        ".a {\n  fill: rgb(236 229 216);\n  stroke: rgb(236, 229, 216);\n  color: rgb(236 229 216 / 0.5);\n}",
        colourMap,
      ),
    ).toStrictEqual(["2: GAME_CREAM", "3: GAME_CREAM"]);
  });

  test("counts lines from the style block's first line", () => {
    expect.hasAssertions();

    expect(getRestatedGameColours(".a {\n  color: #ece5d8;\n}", colourMap, 40)).toStrictEqual(["41: GAME_CREAM"]);
  });

  test("skips the constant read through v-bind and a literal inside a comment", () => {
    expect.hasAssertions();

    expect(
      getRestatedGameColours(".a {\n  /* the cream #ece5d8 */\n  color: v-bind(GAME_CREAM);\n}", colourMap),
    ).toStrictEqual([]);
  });
});
