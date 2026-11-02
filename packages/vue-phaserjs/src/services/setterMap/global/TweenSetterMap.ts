import type { TweenConfiguration } from "#src/models/configuration/global/TweenConfiguration";
import type { TweenEventEmitsOptions } from "#src/models/emit/global/TweenEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { TweenSetter } from "#src/models/setterMap/global/TweenSetter";
import { Tweens } from "phaser";

// A game object runs one tween at a time, so a new one replaces the running one rather than running beside it. A
// replaced tween never completes: a promise over it never settles, and its completion cannot clear the owner's ref
// over the tween that replaced it, so callers await a tween before starting the next. A tween whose game object is
// destroyed still completes at its next update, as Phaser completes a tween on a destroyed target: its completion
// clears the owner's ref and settles whatever awaits it.
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
