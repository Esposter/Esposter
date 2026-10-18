import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe("screenKindGameTextKeyMap", () => {
  test("the Blessing screen is titled as the statue's Blessing screen is", () => {
    expect.hasAssertions();

    expect(ScreenKindGameTextKeyMap[ScreenKind.Blessing]).toBe(GameTextKey.StatueBlessing);
  });
});
