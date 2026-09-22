import type { UserSettings } from "#src/models/UserSettings";

import { PLUGIN_MARKER } from "#src/services/constants";
import { FOREIGN_STATUS_LINE } from "#src/services/constants.test";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";
import { getSettingsWithStatusLine } from "#src/services/getSettingsWithStatusLine";
import { describe, expect, test } from "vitest";

describe(getSettingsWithStatusLine, () => {
  test("writes the plugin's status line into settings that have none", () => {
    expect.hasAssertions();

    const settings: UserSettings = { model: "model" };

    expect(getSettingsWithStatusLine(settings)).toStrictEqual({ model: "model", statusLine: getPluginStatusLine() });
  });

  test("leaves a status line that is not ours alone", () => {
    expect.hasAssertions();

    const settings: UserSettings = { statusLine: FOREIGN_STATUS_LINE };

    expect(getSettingsWithStatusLine(settings).statusLine).toStrictEqual(FOREIGN_STATUS_LINE);
  });

  test("replaces a status line an earlier install pasted by hand", () => {
    expect.hasAssertions();

    const settings: UserSettings = { statusLine: { command: PLUGIN_MARKER, type: "command" } };

    expect(getSettingsWithStatusLine(settings).statusLine).toStrictEqual(getPluginStatusLine());
  });
});
