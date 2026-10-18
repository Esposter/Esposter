import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { getChannelGain } from "#src/services/menu/getChannelGain";
import { describe, expect, test } from "vitest";

describe(getChannelGain, () => {
  test("music Volume sets the music level", () => {
    expect.hasAssertions();

    expect(getChannelGain({ ...GENSHIN_SETTINGS_DEFAULTS, musicVolume: 4 }, VolumeSetting.Music)).toBe(0.4);
  });
});
