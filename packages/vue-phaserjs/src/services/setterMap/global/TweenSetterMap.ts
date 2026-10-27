import type { TweenConfiguration } from "#src/models/configuration/global/TweenConfiguration";
import type { TweenEventEmitsOptions } from "#src/models/emit/global/TweenEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { Tweens } from "phaser";
import { TweenSetter } from "#src/models/setterMap/global/TweenSetter";

// A game object runs one tween at a time, so a new one replaces the running one rather than running beside it
const activeTweens = new WeakMap<GameObjects.GameObject, Tweens.Tween | Tweens.TweenChain>();
const replaceActiveTween = (
  gameObject: GameObjects.GameObject,
  tween: Tweens.Tween | Tweens.TweenChain,
  onComplete: () => void,
) => {
  activeTweens.get(gameObject)?.destroy();
  activeTweens.set(gameObject, tween);
  tween.on(Tweens.Events.TWEEN_COMPLETE, onComplete);
};

export const TweenSetterMap = {
  [TweenSetter.Tween]: (gameObject, emit) => (value) => {
    if (!value) return;

    replaceActiveTween(gameObject, gameObject.scene.add.tween({ ...value, targets: gameObject }), () => {
      emit("update:tween", undefined);
    });
  },
  [TweenSetter.Tweenchain]: (gameObject, emit) => (value) => {
    if (!value) return;

    replaceActiveTween(
      gameObject,
      gameObject.scene.add.tweenchain(value.map((configuration) => ({ ...configuration, targets: gameObject }))),
      () => {
        emit("update:tweenchain", undefined);
      },
    );
  },
} as const satisfies SetterMap<TweenConfiguration, GameObjects.GameObject, TweenEventEmitsOptions>;
