import type { SoundStart } from "#src/models/genshinAssets/sound/SoundStart";
import type { SoundEffect } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { createSoundEffectEntry } from "#src/services/genshinAssets/fit/createSoundEffectEntry";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { describe, expect, test, vi } from "vitest";

// The game's sounds are read from its install, so the fit's read is a double that answers each effect with a fixed one
const { fitSoundEffect } = vi.hoisted(() => ({
  fitSoundEffect: vi.fn<(pattern: string, sounds: readonly SoundStart[]) => Promise<SoundEffect>>(),
}));
vi.mock(import("#src/services/genshinAssets/fit/fitSoundEffect"), () => ({ fitSoundEffect }));

describe(createSoundEffectEntry, () => {
  const RUN_OPTIONS = { isDryRun: true };
  const SOUND_EFFECT: SoundEffect = { frameSeconds: 0.1, leftLevels: [], rightLevels: [], sharedLevels: [] };

  // A component's record is keyed by the component itself, so a refit of one replaces only its own record
  test("a component's sound record is read under its own key", async () => {
    expect.hasAssertions();
    fitSoundEffect.mockResolvedValue(SOUND_EFFECT);

    await expect(
      runFits([createSoundEffectEntry(DerivedAssetComponent.Hud)], ["sounds"], RUN_OPTIONS),
    ).resolves.toStrictEqual({ notes: [], objects: { "hud/sounds": {} }, retired: [] });
    await expect(
      runFits([createSoundEffectEntry(DerivedAssetComponent.Login)], [], RUN_OPTIONS),
    ).resolves.toStrictEqual({ notes: [], objects: { "login/sounds": { door: SOUND_EFFECT } }, retired: [] });
  });

  // A component with no sound effects mapped is opt-in, so an ordinary run leaves its empty record out
  test("an ordinary run publishes no sound record for a component with no sound effects", async () => {
    expect.hasAssertions();

    await expect(runFits([createSoundEffectEntry(DerivedAssetComponent.Hud)], [], RUN_OPTIONS)).resolves.toStrictEqual({
      notes: [],
      objects: {},
      retired: [],
    });
  });
});
