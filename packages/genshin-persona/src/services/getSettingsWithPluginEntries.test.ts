import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { SPINNER_VERBS } from "#src/services/constants";
import { getPluginStatusLine } from "#src/services/getPluginStatusLine";
import { getSettingsWithPluginEntries } from "#src/services/getSettingsWithPluginEntries";
import { describe, expect, test } from "vitest";

describe(getSettingsWithPluginEntries, () => {
  const ownVerb = "ownVerb";
  const sharedVerbs = SPINNER_VERBS.slice(0, 1);
  const laterVerbs = SPINNER_VERBS.slice(1);
  const foreignStatusLine = { command: "command", type: "command" } as const;

  test("writes both entries into empty settings and keeps every other key", () => {
    expect.hasAssertions();

    const settings: UserSettings = { model: "model" };

    expect(getSettingsWithPluginEntries(settings)).toStrictEqual({
      model: "model",
      spinnerVerbs: { mode: SpinnerVerbsMode.Append, verbs: SPINNER_VERBS },
      statusLine: getPluginStatusLine(),
    });
  });

  test("appends our verbs once behind the person's own, keeping their mode", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      spinnerVerbs: { mode: SpinnerVerbsMode.Replace, verbs: [ownVerb, ...SPINNER_VERBS] },
    };

    expect(getSettingsWithPluginEntries(settings).spinnerVerbs).toStrictEqual({
      mode: SpinnerVerbsMode.Replace,
      verbs: [ownVerb, ...SPINNER_VERBS],
    });
  });

  test("leaves a verb the person listed first where they put it", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      spinnerVerbs: { mode: SpinnerVerbsMode.Append, verbs: [...sharedVerbs, ownVerb] },
    };

    expect(getSettingsWithPluginEntries(settings).spinnerVerbs).toStrictEqual({
      mode: SpinnerVerbsMode.Append,
      verbs: [...sharedVerbs, ownVerb, ...laterVerbs],
    });
  });

  test("leaves a status line that is not ours alone", () => {
    expect.hasAssertions();

    const settings: UserSettings = { statusLine: foreignStatusLine };

    expect(getSettingsWithPluginEntries(settings).statusLine).toStrictEqual(foreignStatusLine);
  });

  test("replaces a status line an earlier install pasted by hand", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      statusLine: { command: 'node "genshin-persona/scripts/status.ts"', type: "command" },
    };

    expect(getSettingsWithPluginEntries(settings).statusLine).toStrictEqual(getPluginStatusLine());
  });
});
