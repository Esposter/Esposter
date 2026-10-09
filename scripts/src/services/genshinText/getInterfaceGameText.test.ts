import { getInterfaceGameText } from "#src/services/genshinText/getInterfaceGameText";
import { describe, expect, test } from "vitest";

describe(getInterfaceGameText, () => {
  test("keeps the colour tags, dropping every other tag", () => {
    expect.hasAssertions();

    expect(getInterfaceGameText("<color=#FC3>a</color><i>b</i>")).toBe("<color=#FC3>a</color>b");
  });
});
