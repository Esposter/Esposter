import type { AnimationConfiguration } from "#src/models/configuration/shared/AnimationConfiguration";
import type { SpriteEventEmitsOptions } from "#src/models/emit/SpriteEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { AnimationSetter } from "#src/models/setterMap/shared/AnimationSetter";
import { ANIMATION_COMPLETE_EVENT_PREFIX } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// This setter's own completion listener, per sprite and per event. `off(event)` with no callback would take the
// Consumer's listeners for the same animation with it, and a published package cannot know what a consumer
// Attached; keyed by the game object so a destroyed sprite takes its entry with it.
const completionListeners = new WeakMap<GameObjects.Sprite, Map<string, () => void>>();

export const AnimationSetterMap = {
  [AnimationSetter.Animations]: (gameObject, emit) => (configurations) => {
    if (!(configurations && configurations.length > 0)) return;

    const listeners = completionListeners.get(gameObject) ?? new Map<string, () => void>();
    completionListeners.set(gameObject, listeners);

    for (const configuration of configurations) {
      if (!configuration.key) continue;
      const event: `${typeof ANIMATION_COMPLETE_EVENT_PREFIX}${string}` = `${ANIMATION_COMPLETE_EVENT_PREFIX}${configuration.key}`;
      // Re-running this setter before a prior animation completes must not stack a second listener for the same key
      const previousListener = listeners.get(event);
      if (previousListener) gameObject.off(event, previousListener);

      const listener = () => {
        emit(event);
      };
      listeners.set(event, listener);
      gameObject.once(event, listener);

      if (gameObject.scene.anims.exists(configuration.key)) continue;
      if (!gameObject.scene.anims.create(configuration))
        throw new InvalidOperationError(Operation.Create, "Animation", configuration.key);
    }
  },
  [AnimationSetter.PlayAnimationKey]: (gameObject) => (value) => {
    if (value === undefined) {
      gameObject.stop();
      return;
    }

    gameObject.play(value);
  },
} as const satisfies SetterMap<AnimationConfiguration, GameObjects.Sprite, SpriteEventEmitsOptions>;
