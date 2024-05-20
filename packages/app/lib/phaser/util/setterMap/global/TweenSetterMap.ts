import type { TweenConfiguration } from "@/lib/phaser/models/configuration/global/TweenConfiguration";
import type { TweenEventEmitsOptions } from "@/lib/phaser/models/emit/global/TweenEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const TweenSetterMap = {
  tween: (gameObject, emit) => (value) => {
    if (!value) return;

    const tween = gameObject.scene.add.tween({ ...value, targets: gameObject });
    tween.on("complete", () => {
      emit("update:tween", undefined);
    });
  },
  tweenchain: (gameObject, emit) => (value) => {
    if (!value) return;

    const tweenchain = gameObject.scene.add.tweenchain(value.map((c) => ({ ...c, targets: gameObject })));
    tweenchain.on("complete", () => {
      emit("update:tweenchain", undefined);
    });
    return tweenchain;
  },
} as const satisfies SetterMap<TweenConfiguration, GameObjects.GameObject, TweenEventEmitsOptions>;
