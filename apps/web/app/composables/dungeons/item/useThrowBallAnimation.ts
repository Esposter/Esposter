import type { SceneWithPlugins } from "vue-phaserjs";

import { CaptureResult } from "@/models/dungeons/item/CaptureResult";
import { getTweenRange } from "@/services/dungeons/animation/getTweenRange";
import { useBallStore } from "@/store/dungeons/battle/ball";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Math } from "phaser";
import { sleepScene, useTween } from "vue-phaserjs";

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
        duration: Temporal.Duration.from({ seconds: 1 }).total("milliseconds"),
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
        delay: 200,
        duration: 150,
        ease: Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve();
        },
        repeat: captureResult === CaptureResult.Failure ? 0 : 2,
        repeatDelay: 800,
        targets: pathFollowerValue,
        x: pathFollowerValue.x + 10,
        yoyo: true,
      });
    });
  // The enemy fades out as it is caught, and back in when the ball fails to hold it
  const playEnemyFadeAnimation = (fromAlpha: number, toAlpha: number) =>
    new Promise<void>((resolve) => {
      useTween(monsterTween, {
        alpha: getTweenRange(fromAlpha, toAlpha),
        duration: 500,
        ease: Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve();
        },
      });
    });

  await playThrowBallAnimation();
  await playEnemyFadeAnimation(1, 0);
  await playShakeBallAnimation();
  await sleepScene(scene, 500);
  isVisible.value = false;
  if (captureResult !== CaptureResult.Success) await playEnemyFadeAnimation(0, 1);
};
