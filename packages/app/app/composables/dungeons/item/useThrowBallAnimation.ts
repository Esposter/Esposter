import type { SceneWithPlugins } from "vue-phaserjs";

import { CaptureResult } from "#shared/models/dungeons/item/CaptureResult";
import { dayjs } from "#shared/services/dayjs";
import { useBallStore } from "@/store/dungeons/battle/ball";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Math } from "phaser";
import { sleep, useTween } from "vue-phaserjs";

export const useThrowBallAnimation = async (scene: SceneWithPlugins, captureResult: CaptureResult) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const ballStore = useBallStore();
  const { endPosition, startPosition } = ballStore;
  const { isVisible, pathFollower } = storeToRefs(ballStore);
  const pathFollowerValue = pathFollower.value;
  if (!pathFollowerValue) return;

  if (isSkipAnimations.value) {
    pathFollowerValue.setPosition(endPosition.x, endPosition.y);
    isVisible.value = true;
    return;
  }

  const enemyStore = useEnemyStore();
  const { monsterTween } = storeToRefs(enemyStore);

  const playThrowBallAnimation = () =>
    new Promise<void>((resolve) => {
      pathFollowerValue.setPosition(startPosition.x, startPosition.y);
      isVisible.value = true;
      pathFollowerValue.startFollow({
        duration: dayjs.duration(1, "second").asMilliseconds(),
        ease: Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve();
        },
      });
    });

  const playShakeBallAnimation = () =>
    new Promise<void>((resolve) => {
      // For some unknown reason, useTween doesn't work here...
      pathFollowerValue.scene.add.tween({
        delay: dayjs.duration(0.2, "seconds").asMilliseconds(),
        duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
        ease: Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve();
        },
        repeat: captureResult === CaptureResult.Failure ? 0 : 2,
        repeatDelay: dayjs.duration(0.8, "seconds").asMilliseconds(),
        targets: pathFollowerValue,
        x: pathFollowerValue.x + 10,
        yoyo: true,
      });
    });

  const playCatchEnemyAnimation = () =>
    new Promise<void>((resolve) => {
      useTween(monsterTween, {
        alpha: {
          from: 1,
          start: 1,
          to: 0,
        },
        duration: dayjs.duration(0.5, "seconds").asMilliseconds(),
        ease: Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve();
        },
      });
    });

  const playCatchEnemyFailedAnimation = () =>
    new Promise<void>((resolve) => {
      useTween(monsterTween, {
        alpha: {
          from: 0,
          start: 0,
          to: 1,
        },
        duration: dayjs.duration(0.5, "seconds").asMilliseconds(),
        ease: Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve();
        },
      });
    });

  await playThrowBallAnimation();
  await playCatchEnemyAnimation();
  await playShakeBallAnimation();
  await sleep(scene, dayjs.duration(0.5, "seconds").asMilliseconds());
  isVisible.value = false;
  if (captureResult !== CaptureResult.Success) await playCatchEnemyFailedAnimation();
};
