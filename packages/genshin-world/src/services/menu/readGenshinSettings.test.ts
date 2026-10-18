import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { readGenshinSettings } from "#src/services/menu/readGenshinSettings";
import { QualityTier } from "genshin-engine";
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

  test("a chosen slope pitch is kept on this device", () => {
    expect.hasAssertions();

    const storedSettings = JSON.stringify({ ...GENSHIN_SETTINGS_DEFAULTS, slopePitch: true });

    expect(readGenshinSettings(storedSettings, GENSHIN_SETTINGS_DEFAULTS).slopePitch).toBe(true);
  });
});
