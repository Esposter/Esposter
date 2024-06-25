import type { TweenConfiguration } from "@/lib/phaser/models/configuration/global/TweenConfiguration";
import type { TweenEventEmitsOptions } from "@/lib/phaser/models/emit/global/TweenEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const TweenSetterMap = {
  tween: (gameObject, emit) =>
    createTween((configuration) => {
      const tween = gameObject.scene.add.tween({ ...configuration, targets: gameObject });
      tween.on("complete", () => {
        emit("update:tween", undefined);
      });
      return tween;
    }),
  tweenchain: (gameObject, emit) =>
    createTween((configurations) => {
      const tweenchain = gameObject.scene.add.tweenchain(configurations.map((c) => ({ ...c, targets: gameObject })));
      tweenchain.on("complete", () => {
        emit("update:tweenchain", undefined);
      });
      return tweenchain;
    }),
} as const satisfies SetterMap<TweenConfiguration, GameObjects.GameObject, TweenEventEmitsOptions>;

const createTween = <TTween extends { destroy: () => void }, TConfiguration extends object>(
  callback: (configuration: TConfiguration) => TTween,
) => {
  let previousTween: TTween | undefined;
  return (configuration?: TConfiguration) => {
    if (previousTween) previousTween.destroy();
    previousTween = configuration ? callback(configuration) : undefined;
  };
};
