import type { SpinnerTipsOverride } from "#src/models/SpinnerTipsOverride";
import type { UserSettings } from "#src/models/UserSettings";

import english from "#src/localizations/english";
import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { getSpinner } from "#src/services/getSpinner";
import { describe, expect, test } from "vitest";

describe(checkIsPluginSpinner, () => {
  test("reads the spinner setup wrote as ours", () => {
    expect.hasAssertions();

    const settings = getSettingsWithSpinner({}, getSpinner(english, { displayName: "Hu Tao", name: "Hu Tao" }, [], []));

    expect(checkIsPluginSpinner(settings)).toBe(true);
  });

  test("leaves a spinner someone else wrote under the same nameplate alone", () => {
    expect.hasAssertions();

    const settings: UserSettings = {
      spinnerTipsOverride: { excludeDefault: true, label: "✦ Their own", tips: [{ id: "their-1", text: "tip" }] },
    };

    expect(checkIsPluginSpinner(settings)).toBe(false);
  });

  test("reads an override shaped unlike the model as nobody's", () => {
    expect.hasAssertions();

    const settings: UserSettings = { spinnerTipsOverride: { tips: [null] } as unknown as SpinnerTipsOverride };

    expect(checkIsPluginSpinner(settings)).toBe(false);
  });
});
