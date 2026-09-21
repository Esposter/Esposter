import type { UserSettings } from "#src/models/UserSettings";
import type { readSpinner as baseReadSpinner } from "#src/services/readSpinner";
import type { readUserSettings as baseReadUserSettings } from "#src/services/readUserSettings";
import type { writeUserSettings as baseWriteUserSettings } from "#src/services/writeUserSettings";

import english from "#src/localizations/english";
import { DEFAULT_LANGUAGE } from "#src/services/constants";
import { getSettingsWithoutPluginEntries } from "#src/services/getSettingsWithoutPluginEntries";
import { getSettingsWithSpinner } from "#src/services/getSettingsWithSpinner";
import { getSpinner } from "#src/services/getSpinner";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { readSpinner, readUserSettings, writeUserSettings } = vi.hoisted(() => ({
  readSpinner: vi.fn<typeof baseReadSpinner>(),
  readUserSettings: vi.fn<typeof baseReadUserSettings>(),
  writeUserSettings: vi.fn<typeof baseWriteUserSettings>(),
}));

// The settings file stands in as one object every double reads and writes, which is what lets a `teardown` land
// While the lines are read; the lines are the wiki round trip the wait is on
vi.mock(import("#src/services/readSpinner"), () => ({ readSpinner: readSpinner as unknown as typeof baseReadSpinner }));

vi.mock(import("#src/services/readUserSettings"), () => ({
  readUserSettings: readUserSettings as unknown as typeof baseReadUserSettings,
}));

vi.mock(import("#src/services/writeUserSettings"), () => ({
  writeUserSettings: writeUserSettings as unknown as typeof baseWriteUserSettings,
}));

describe(writeSessionSpinner, () => {
  const character = { displayName: "Hu Tao", name: "Hu Tao" };
  const spinner = getSpinner(english, character, [], [{ text: "text", title: "title" }]);
  const otherSpinner = getSpinner(
    english,
    { displayName: "Venti", name: "Venti" },
    [],
    [{ text: "otherText", title: "title" }],
  );
  let settings: UserSettings = {};

  beforeEach(() => {
    vi.clearAllMocks();
    settings = getSettingsWithSpinner({ model: "model" }, otherSpinner);
    readUserSettings.mockImplementation(() => structuredClone(settings));
    writeUserSettings.mockImplementation((newSettings) => {
      settings = newSettings;
    });
    readSpinner.mockResolvedValue(spinner);
  });

  test("writes the spinner where the settings are ours and the label is another character's", async () => {
    expect.hasAssertions();

    await writeSessionSpinner(character, undefined, DEFAULT_LANGUAGE);

    expect(settings).toStrictEqual(getSettingsWithSpinner({ model: "model" }, spinner));
  });

  test("leaves a spinner a teardown removed while the lines were read removed", async () => {
    expect.hasAssertions();

    readSpinner.mockImplementation(() => {
      writeUserSettings(getSettingsWithoutPluginEntries(settings));
      return Promise.resolve(spinner);
    });

    await writeSessionSpinner(character, undefined, DEFAULT_LANGUAGE);

    expect(settings).toStrictEqual({ model: "model" });
    expect(writeUserSettings).toHaveBeenCalledTimes(1);
  });
});
