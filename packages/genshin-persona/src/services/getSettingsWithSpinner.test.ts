import type { Spinner } from "#src/models/Spinner";
import type { UserSettings } from "#src/models/UserSettings";

import { SpinnerVerbsMode } from "#src/models/SpinnerVerbsMode";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { describe, expect, test } from "vitest";

describe(getSettingsWithSpinner, () => {
  const spinner: Spinner = { label: "label", tips: [{ id: "id", text: "text" }], verbs: ["verb"] };

  test("replaces both spinner keys with the plugin's and keeps every other key", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      model: "model",
      spinnerVerbs: { mode: SpinnerVerbsMode.Append, verbs: ["ownVerb"] },
    };

    expect(getSettingsWithSpinner(settings, spinner)).toStrictEqual({
      model: "model",
      spinnerTipsOverride: { excludeDefault: true, label: spinner.label, tips: spinner.tips },
      spinnerVerbs: { mode: SpinnerVerbsMode.Replace, verbs: spinner.verbs },
    });
  });
});
