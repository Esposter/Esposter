import { type TweenConfiguration } from "@/lib/phaser/models/configuration/global/TweenConfiguration";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type GameObjects, type Tweens, type Types } from "phaser";

export const TweenSetterMap = {
  tween: (gameObject, emit) =>
    createTween<Tweens.Tween, Types.Tweens.TweenBuilderConfig>((configuration) => {
      const tween = gameObject.scene.add.tween({ ...configuration, targets: gameObject });
      if (emit) tween.on("complete", () => emit("update:tween", undefined));
      return tween;
    }),
  tweenchain: (gameObject, emit) =>
    createTween<Tweens.TweenChain, Types.Tweens.TweenBuilderConfig[]>((configurations) => {
      const tweenchain = gameObject.scene.add.tweenchain(configurations);
      if (emit) tweenchain.on("complete", () => emit("update:tweenchain", undefined));
      return tweenchain;
    }),
} satisfies SetterMap<TweenConfiguration, GameObjects.GameObject>;

const createTween = <TTween extends { destroy: () => void }, TConfiguration extends object>(
  callback: (config: TConfiguration) => TTween,
) => {
  let previousTween: TTween | undefined;
  return (config?: TConfiguration) => {
    if (previousTween) previousTween.destroy();
    previousTween = config ? callback(config) : undefined;
  };
};
