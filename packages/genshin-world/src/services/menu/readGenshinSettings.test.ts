import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { readGenshinSettings } from "#src/services/menu/readGenshinSettings";
import { QualityTier } from "genshin-engine";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(readGenshinSettings, () => {
  test("a chosen quality tier is kept on this device", () => {
    expect.hasAssertions();

    const storedSettings = JSON.stringify({ ...GENSHIN_SETTINGS_DEFAULTS, qualityTier: QualityTier.Low });

    expect(readGenshinSettings(storedSettings, GENSHIN_SETTINGS_DEFAULTS).qualityTier).toBe(QualityTier.Low);
  });

  test("another browser starts from the default tier", () => {
    expect.hasAssertions();

    expect(readGenshinSettings(null, GENSHIN_SETTINGS_DEFAULTS).qualityTier).toBe(QualityTier.High);
  });

  test("a chosen camera distance is kept on this device", () => {
    expect.hasAssertions();

    const storedSettings = JSON.stringify({ ...GENSHIN_SETTINGS_DEFAULTS, defaultDistance: 5.5 });

    expect(readGenshinSettings(storedSettings, GENSHIN_SETTINGS_DEFAULTS).defaultDistance).toBe(5.5);
  });

  test("every setting a player chooses is kept on this device", () => {
    expect.hasAssertions();

    const chosenSettings: GenshinSettings = {
      defaultDistance: 5.5,
      horizontalSensitivity: 4,
      language: GameLanguage.German,
      musicVolume: 4,
      qualityTier: QualityTier.Low,
      sfxVolume: 6,
      slopePitch: true,
      verticalSensitivity: 2,
      volume: 7,
    };

    expect(readGenshinSettings(JSON.stringify(chosenSettings), GENSHIN_SETTINGS_DEFAULTS)).toStrictEqual(
      chosenSettings,
    );
  });
});
