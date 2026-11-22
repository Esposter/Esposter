import type { SettingsCategory } from "#src/models/message/room/SettingsCategory";
import type { SettingsType } from "#src/models/message/room/SettingsType";
import type { SettingsCategoryMap } from "#src/services/message/settings/SettingsCategoryMap";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("settingsCategoryMap type", () => {
  test("every settings type but Delete sits in a category, so a type missing from the grouping fails the check", () => {
    expect.hasAssertions();

    expectTypeOf<Exclude<SettingsType, (typeof SettingsCategoryMap)[SettingsCategory][number]>>().toEqualTypeOf<
      typeof SettingsType.Delete
    >();
  });
});
