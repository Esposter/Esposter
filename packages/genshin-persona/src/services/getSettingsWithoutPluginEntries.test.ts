import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { SPINNER_VERBS } from "#src/services/constants";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { describe, expect, test } from "vitest";

describe(getSettingsWithoutPluginEntries, () => {
  const ownVerb = "ownVerb";
  const foreignStatusLine = { command: "command", type: "command" } as const;

  test("removes exactly what setup wrote and keeps every other key", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      model: "model",
      spinnerVerbs: { mode: SpinnerVerbsMode.Append, verbs: SPINNER_VERBS },
      statusLine: getPluginStatusLine(),
    };

    expect(getSettingsWithoutPluginEntries(settings)).toStrictEqual({ model: "model" });
  });

  test("keeps the person's own verbs and a status line that is not ours", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      spinnerVerbs: { mode: SpinnerVerbsMode.Replace, verbs: [ownVerb, ...SPINNER_VERBS] },
      statusLine: foreignStatusLine,
    };

    expect(getSettingsWithoutPluginEntries(settings)).toStrictEqual({
      spinnerVerbs: { mode: SpinnerVerbsMode.Replace, verbs: [ownVerb] },
      statusLine: foreignStatusLine,
    });
  });
});
