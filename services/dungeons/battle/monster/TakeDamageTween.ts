import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";
import { dayjs } from "@/services/dayjs";

export const TakeDamageTween: TweenBuilderConfiguration = {
  delay: 0,
  repeat: 10,
  duration: dayjs.duration(0.15, "seconds").asMilliseconds(),
  alpha: {
    from: 1,
    start: 1,
    to: 0,
  },
  onComplete: (_, monsterImageGameObject) => {
    monsterImageGameObject.setAlpha(1);
  },
};
