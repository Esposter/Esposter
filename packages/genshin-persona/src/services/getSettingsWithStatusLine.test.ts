import type { UserSettings } from "#src/models/UserSettings";

import { getPluginStatusLine } from "#src/services/getPluginStatusLine";
import { getSettingsWithStatusLine } from "#src/services/getSettingsWithStatusLine";
import { describe, expect, test } from "vitest";

describe(getSettingsWithStatusLine, () => {
  const foreignStatusLine = { command: "command", type: "command" } as const;

  test("writes the plugin's status line into settings that have none", () => {
    expect.hasAssertions();

    const settings: UserSettings = { model: "model" };

    expect(getSettingsWithStatusLine(settings)).toStrictEqual({ model: "model", statusLine: getPluginStatusLine() });
  });

  test("leaves a status line that is not ours alone", () => {
    expect.hasAssertions();

    const settings: UserSettings = { statusLine: foreignStatusLine };

    expect(getSettingsWithStatusLine(settings).statusLine).toStrictEqual(foreignStatusLine);
  });

  test("replaces a status line an earlier install pasted by hand", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      statusLine: { command: 'node "genshin-persona/scripts/status.ts"', type: "command" },
    };

    expect(getSettingsWithStatusLine(settings).statusLine).toStrictEqual(getPluginStatusLine());
  });
});
