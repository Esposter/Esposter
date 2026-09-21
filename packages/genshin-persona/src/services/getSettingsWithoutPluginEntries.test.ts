import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { FOREIGN_HOOK_ENTRY, FOREIGN_STATUS_LINE } from "#src/services/constants.test";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithSpeakHook } from "#src/services/getSettingsWithSpeakHook";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSettingsWithoutPluginEntries, () => {
  const spinner = getSpinner(["verb"], { description: "description", displayName: "name", name: "name" }, [], []);

  test("removes exactly what setup and voice wrote and keeps every other key", () => {
    expect.hasAssertions();

    const settings = getSettingsWithSpeakHook(
      getSettingsWithSpinner({ model: "model", statusLine: getPluginStatusLine() }, spinner),
    );

    expect(getSettingsWithoutPluginEntries(settings)).toStrictEqual({ model: "model" });
  });

  test("keeps a spinner, a status line and hook entries that are not ours", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      hooks: { MessageDisplay: [FOREIGN_HOOK_ENTRY], Stop: [FOREIGN_HOOK_ENTRY] },
      spinnerTipsOverride: { excludeDefault: false, tips: [{ id: "id", text: "text" }] },
      spinnerVerbs: { mode: SpinnerVerbsMode.Append, verbs: ["ownVerb"] },
      statusLine: FOREIGN_STATUS_LINE,
    };

    expect(getSettingsWithoutPluginEntries(getSettingsWithSpeakHook(settings))).toStrictEqual(settings);
  });
});
