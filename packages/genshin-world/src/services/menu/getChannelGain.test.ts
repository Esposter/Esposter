import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { getChannelGain } from "#src/services/menu/getChannelGain";
import { describe, expect, test } from "vitest";

describe(getChannelGain, () => {
  test("music Volume sets the music level", () => {
    expect.hasAssertions();

    expect(getChannelGain({ ...GENSHIN_SETTINGS_DEFAULTS, musicVolume: 4 }, VolumeSetting.Music)).toBe(0.4);
  });

  test("sfx Volume sets the sound effect level", () => {
    expect.hasAssertions();

    expect(getChannelGain({ ...GENSHIN_SETTINGS_DEFAULTS, sfxVolume: 3 }, VolumeSetting.Sfx)).toBe(0.3);
  });

  test("volume scales the music and the sound effects", () => {
    expect.hasAssertions();

    const settings = { ...GENSHIN_SETTINGS_DEFAULTS, musicVolume: 10, sfxVolume: 10, volume: 5 };

    expect(getChannelGain(settings, VolumeSetting.Music)).toBe(0.5);
    expect(getChannelGain(settings, VolumeSetting.Sfx)).toBe(0.5);
  });
});
