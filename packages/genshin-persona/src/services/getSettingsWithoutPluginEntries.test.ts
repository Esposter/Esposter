import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(getSettingsWithoutPluginEntries, () => {
  const spinner = getSpinner({ tips: ["baseTip"], verbs: ["verb"] }, "name", [], []);
  const foreignStatusLine = { command: "command", type: "command" } as const;

  test("removes exactly what setup wrote and keeps every other key", () => {
    expect.hasAssertions();

    const settings = getSettingsWithSpinner({ model: "model", statusLine: getPluginStatusLine() }, spinner);

    expect(getSettingsWithoutPluginEntries(settings)).toStrictEqual({ model: "model" });
  });

  test("keeps a spinner and a status line that are not ours", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      spinnerTipsOverride: { excludeDefault: false, tips: [{ id: "id", text: "text" }] },
      spinnerVerbs: { mode: SpinnerVerbsMode.Append, verbs: ["ownVerb"] },
      statusLine: foreignStatusLine,
    };

    expect(getSettingsWithoutPluginEntries(settings)).toStrictEqual(settings);
  });
});
