/* oxlint-disable vitest/prefer-import-in-mock -- Partial fakes: the typed modules would load Phaser, which cannot
   initialise under the test environment, and the skip path reads none of their values */
import type { GameObjects } from "phaser";

import { AnimationsSetting } from "#shared/models/dungeons/data/settings/AnimationsSetting";
import { getInitialSettings } from "#shared/models/dungeons/data/settings/Settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { CaptureResult } from "#src/models/dungeons/item/CaptureResult";
import { animateThrowBall } from "#src/services/dungeons/item/animateThrowBall";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { useBallStore } from "#src/store/dungeons/battle/ball";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("#src/store/dungeons/index", () => import("#src/store/dungeons/index.test"));

// The throw's easing and tweens are Phaser's, and the skip path plays none of them
vi.mock("phaser", () => ({}));
vi.mock("vue-phaserjs", () => ({}));

describe(animateThrowBall, () => {
  const scene = createSceneWithPlugins();

  beforeEach(() => {
    setActivePinia(createPinia());
    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    settings.value = getInitialSettings();
  });

  // With animations off the throw skips its presentation, and the ball must end where the presentation ends: hidden,
  // Left at its end position, so it is not drawn over the monster after the throw
  test("with animations off, the ball ends hidden at its end position", async () => {
    expect.hasAssertions();

    const settingsStore = useSettingsStore();
    const { settings } = storeToRefs(settingsStore);
    settings.value[SettingsOption.Animations] = AnimationsSetting.Off;
    const ballStore = useBallStore();
    const { isVisible, pathFollower } = storeToRefs(ballStore);
    const { endPosition } = ballStore;
    const setPosition = vi.fn<(x: number, y: number) => void>();
    pathFollower.value = { setPosition } as unknown as GameObjects.PathFollower;

    await animateThrowBall(scene, CaptureResult.Success);

    expect(isVisible.value).toBe(false);
    expect(setPosition).toHaveBeenCalledExactlyOnceWith(endPosition.x, endPosition.y);
  });
});
