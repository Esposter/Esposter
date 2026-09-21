import type { UserSettings } from "#src/models/UserSettings";

import { FOREIGN_HOOK_ENTRY } from "#src/services/constants.test";
import { getPluginSpeakHookEntry } from "#src/services/getPluginSpeakHookEntry";
import { getSettingsWithSpeakHook } from "#src/services/getSettingsWithSpeakHook";
import { describe, expect, test } from "vitest";

describe(getSettingsWithSpeakHook, () => {
  test("writes the plugin's hook entry into settings that have none", () => {
    expect.hasAssertions();

    const settings: UserSettings = { model: "model" };

    expect(getSettingsWithSpeakHook(settings)).toStrictEqual({
      hooks: { MessageDisplay: [getPluginSpeakHookEntry()] },
      model: "model",
    });
  });

  test("keeps an entry that is not ours, and every other event, and writes ours once", () => {
    expect.hasAssertions();

    const settings: UserSettings = { hooks: { MessageDisplay: [FOREIGN_HOOK_ENTRY], Stop: [FOREIGN_HOOK_ENTRY] } };

    expect(getSettingsWithSpeakHook(getSettingsWithSpeakHook(settings))).toStrictEqual({
      hooks: { MessageDisplay: [FOREIGN_HOOK_ENTRY, getPluginSpeakHookEntry()], Stop: [FOREIGN_HOOK_ENTRY] },
    });
  });
});
