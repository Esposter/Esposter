import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { GENSHIN_SETTINGS_DEFAULTS, GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { getStoredChannelGain } from "#src/services/menu/getStoredChannelGain";
import { afterEach, describe, expect, test } from "vitest";

describe(getStoredChannelGain, () => {
  afterEach(() => {
    localStorage.removeItem(GENSHIN_SETTINGS_STORAGE_KEY);
  });

  // A fresh store reads the levels the Settings screen saved on this device, so a changed volume is the gain sounds play at
  test("a level saved on this device is the gain a fresh store reads", () => {
    expect.hasAssertions();

    localStorage.setItem(
      GENSHIN_SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...GENSHIN_SETTINGS_DEFAULTS, sfxVolume: 4, volume: 5 }),
    );

    expect(getStoredChannelGain(VolumeSetting.Sfx)).toBe(0.2);
  });
});
