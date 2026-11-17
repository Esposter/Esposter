/* oxlint-disable vitest/prefer-import-in-mock -- Partial fakes: the typed modules would load Phaser, which cannot initialise under the test environment, and the skip path reads none of their values */
import type { GameObjects } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AnimationsSetting } from "#shared/models/dungeons/data/settings/AnimationsSetting";
import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { CaptureResult } from "#src/models/dungeons/item/CaptureResult";
import { animateThrowBall } from "#src/services/dungeons/item/animateThrowBall";
import { useBallStore } from "#src/store/dungeons/battle/ball";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The dungeons store imports Phaser, so only its state and its save are faked, and the save shape is kept real
vi.mock("#src/store/dungeons/index", async () => {
  const { Dungeons } = await import("#shared/models/dungeons/data/Dungeons");
  const { reactive } = await import("vue");
  const dungeons = reactive(new Dungeons());
  return { useDungeonsStore: () => ({ dungeons, saveDungeons: vi.fn<() => void>() }) };
});

// The throw's easing and tweens are Phaser's, and the skip path plays none of them
vi.mock("phaser", () => ({}));
vi.mock("vue-phaserjs", () => ({}));

describe(animateThrowBall, () => {
  const scene = {} as SceneWithPlugins;

  beforeEach(() => {
    setActivePinia(createPinia());
    const settingsStore = useSettingsStore();
    settingsStore.settings = getInitialSettings();
  });

  // With animations off the throw skips its presentation, and the ball must end where the presentation ends: hidden,
  // Left at its end position, so it is not drawn over the monster after the throw
  test("with animations off, the ball ends hidden at its end position", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    settingsStore.settings[SettingsOption.Animations] = AnimationsSetting.Off;
    const ballStore = useBallStore();
    const setPosition = vi.fn<(x: number, y: number) => void>();
    ballStore.pathFollower = { setPosition } as unknown as GameObjects.PathFollower;

    await animateThrowBall(scene, CaptureResult.Success);

    expect(ballStore.isVisible).toBe(false);
    expect(setPosition).toHaveBeenCalledExactlyOnceWith(ballStore.endPosition.x, ballStore.endPosition.y);
  });
});
