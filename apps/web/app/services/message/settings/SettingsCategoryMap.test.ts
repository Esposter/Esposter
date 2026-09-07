import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsCategoryMap } from "@/services/message/settings/SettingsCategoryMap";
import { describe, expect, test } from "vitest";

describe("settingsCategoryMap", () => {
  test("every settings type except Delete belongs to exactly one category", () => {
    expect.hasAssertions();

    const categorizedSettingsTypes = Object.values(SettingsCategoryMap).flat();
    const expectedSettingsTypes = Object.values(SettingsType).filter(
      (settingsType) => settingsType !== SettingsType.Delete,
    );

    expect(categorizedSettingsTypes.toSorted()).toStrictEqual(expectedSettingsTypes.toSorted());
  });
});
