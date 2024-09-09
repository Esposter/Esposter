import { useTween } from "@/lib/phaser/composables/useTween";
import { dayjs } from "@/services/dayjs";
import { useBallStore } from "@/store/dungeons/battle/ball";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useSettingsStore } from "@/store/dungeons/settings";
import { sleep } from "@/util/time/sleep";
import { Math } from "phaser";

export const useThrowBallAnimation = async (isCaptureSuccessful: boolean) => {
  const settingsStore = useSettingsStore();
  const { isSkipAnimations } = storeToRefs(settingsStore);
  const ballStore = useBallStore();
  const { endPosition, startPosition } = ballStore;
  const { isVisible, pathFollower, position, tween } = storeToRefs(ballStore);
  const pathFollowerValue = pathFollower.value;
  if (!pathFollowerValue) return;

  if (isSkipAnimations.value) {
    position.value = { ...endPosition };
    isVisible.value = true;
    return;
  }

  const enemyStore = useEnemyStore();
  const { monsterTween } = storeToRefs(enemyStore);

  const playThrowBallAnimation = () =>
    new Promise<void>((resolve) => {
      position.value = { ...startPosition };
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
      useTween(tween, {
        delay: dayjs.duration(0.2, "seconds").asMilliseconds(),
        duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
        ease: Math.Easing.Sine.InOut,
        onComplete: () => {
          resolve();
        },
        repeat: 3,
        repeatDelay: dayjs.duration(0.8, "seconds").asMilliseconds(),
        x: endPosition.x + 10,
        y: endPosition.y,
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
  await sleep(dayjs.duration(0.5, "seconds").asMilliseconds());
  isVisible.value = false;
  if (!isCaptureSuccessful) await playCatchEnemyFailedAnimation();
};
