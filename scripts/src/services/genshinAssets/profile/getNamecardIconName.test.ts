import { NAMECARDLESS_AVATAR_IDS } from "#src/services/genshinAssets/profile/constants";
import { getNamecardIconName } from "#src/services/genshinAssets/profile/getNamecardIconName";
import { describe, expect, test } from "vitest";

describe(getNamecardIconName, () => {
  const AYAKA_ID = 10_000_002;
  const AYAKA_ICON_NAME = "UI_AvatarIcon_Ayaka";
  const XINYAN_ID = 10_000_044;
  const XINYAN_ICON_NAME = "UI_AvatarIcon_Xinyan";

  test("names a namecard after its avatar icon, with the prefix swapped", () => {
    expect.hasAssertions();

    expect(getNamecardIconName(AYAKA_ID, AYAKA_ICON_NAME)).toBe("UI_NameCardIcon_Ayaka");
  });

  test("gives no namecard to the characters the game has none for", () => {
    expect.hasAssertions();

    expect(NAMECARDLESS_AVATAR_IDS).toStrictEqual([XINYAN_ID, 10_000_058, 10_000_061]);
    expect(getNamecardIconName(XINYAN_ID, XINYAN_ICON_NAME)).toBe("");
  });
});
