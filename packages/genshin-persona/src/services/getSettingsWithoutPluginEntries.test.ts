import type { Spinner } from "#src/models/Spinner";
import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { describe, expect, test } from "vitest";

describe(getSettingsWithoutPluginEntries, () => {
  const spinner: Spinner = { label: "label", tips: [], verbs: ["verb"] };
  const foreignStatusLine = { command: "command", type: "command" } as const;

  test("removes exactly what setup wrote and keeps every other key", () => {
    expect.hasAssertions();

    const settings = getSettingsWithSpinner({ model: "model", statusLine: getPluginStatusLine() }, spinner);

    expect(getSettingsWithoutPluginEntries(settings)).toStrictEqual({ model: "model" });
  });

  test("keeps a spinner and a status line that are not ours", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      spinnerVerbs: { mode: SpinnerVerbsMode.Append, verbs: ["ownVerb"] },
      statusLine: foreignStatusLine,
    };

    expect(getSettingsWithoutPluginEntries(settings)).toStrictEqual(settings);
  });
});
