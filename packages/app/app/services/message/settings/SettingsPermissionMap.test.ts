import { SettingsType } from "@/models/message/room/SettingsType";
import { SettingsPermissionMap } from "@/services/message/settings/SettingsPermissionMap";
import { describe, expect, test } from "vitest";

describe("settingsPermissionMap", () => {
  // Profile acts on the reader's own membership, which every member may do, and Delete is guarded by ownership
  // Rather than by a permission
  const UNGATED_SETTINGS_TYPES = new Set([SettingsType.Delete, SettingsType.Profile]);

  test("every panel whose writes need a permission carries an entry", () => {
    expect.hasAssertions();

    const gatedSettingsTypes = Object.keys(SettingsPermissionMap);
    const expectedSettingsTypes = Object.values(SettingsType).filter(
      (settingsType) => !UNGATED_SETTINGS_TYPES.has(settingsType),
    );

    expect(gatedSettingsTypes.toSorted()).toStrictEqual(expectedSettingsTypes.toSorted());
  });
});
