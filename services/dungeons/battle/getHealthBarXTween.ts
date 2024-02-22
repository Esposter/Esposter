import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { dayjs } from "@/services/dayjs";
import { Math } from "phaser";

export const getHealthBarXTween = (
  target: Ref<number>,
  newX: number,
  onComplete?: () => void,
): TweenBuilderConfiguration => ({
  duration: dayjs.duration(1, "second").asMilliseconds(),
  x: newX,
  ease: Math.Easing.Sine.Out,
  onUpdate: (_, __, ___, current) => {
    target.value = current;
  },
  onComplete,
});
