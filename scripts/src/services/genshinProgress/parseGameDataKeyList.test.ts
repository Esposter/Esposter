import { parseGameDataKeyList } from "#src/services/genshinProgress/parseGameDataKeyList";
import { describe, expect, test } from "vitest";

describe(parseGameDataKeyList, () => {
  test("a key list reads every leaf of its two constants, nested or flat", () => {
    expect.hasAssertions();

    const text = [
      "export const GameDataKeys = {",
      '  achievements: { achievements: "achievements/achievements" },',
      '  tips: "tips",',
      "} as const;",
      "",
      "export const GameDataIndexKeys = {",
      '  domains: "domains",',
      "} as const;",
    ].join("\n");

    expect(parseGameDataKeyList(text)).toStrictEqual({
      indexes: ["domains"],
      objects: ["achievements/achievements", "tips"],
    });
  });
});
