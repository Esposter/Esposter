import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects, type Tweens, type Types } from "phaser";
import { type TweenConfiguration } from "~/lib/phaser/models/configuration/global/TweenConfiguration";

export const TweenSetterMap = {
  tween: (gameObject, emit) =>
    createTween<Tweens.Tween, Types.Tweens.TweenBuilderConfig>((configuration) => {
      const tween = gameObject.scene.add.tween({ ...configuration, targets: gameObject });
      if (emit) tween.on("complete", () => emit("update:tween", null));
      return tween;
    }),
} satisfies SetterMap<TweenConfiguration, GameObjects.GameObject>;

const createTween = <TTween extends { stop: () => void }, TConfiguration extends object>(
  callback: (config: TConfiguration) => TTween,
) => {
  let previousTween: TTween | null = null;
  return (config?: TConfiguration) => {
    if (previousTween) previousTween.stop();
    previousTween = config ? callback(config) : null;
  };
};
