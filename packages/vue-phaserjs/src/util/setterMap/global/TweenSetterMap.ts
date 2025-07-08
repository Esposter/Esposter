import type { TweenConfiguration } from "@/models/configuration/global/TweenConfiguration";
import type { TweenEventEmitsOptions } from "@/models/emit/global/TweenEventEmitsOptions";
import type { SetterMap } from "@/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { Tweens } from "phaser";

export const TweenSetterMap = {
  tween: (gameObject, emit) => (value) => {
    if (!value) return;

    const tween = gameObject.scene.add.tween({ ...value, targets: gameObject });
    tween.on(Tweens.Events.TWEEN_COMPLETE, () => {
      // oxlint-disable-next-line no-useless-undefined
      emit("update:tween", undefined);
    });
  },
  tweenchain: (gameObject, emit) => (value) => {
    if (!value) return;

    const tweenchain = gameObject.scene.add.tweenchain(value.map((c) => ({ ...c, targets: gameObject })));
    tweenchain.on(Tweens.Events.TWEEN_COMPLETE, () => {
      // oxlint-disable-next-line no-useless-undefined
      emit("update:tweenchain", undefined);
    });
    return tweenchain;
  },
} as const satisfies SetterMap<TweenConfiguration, GameObjects.GameObject, TweenEventEmitsOptions>;
