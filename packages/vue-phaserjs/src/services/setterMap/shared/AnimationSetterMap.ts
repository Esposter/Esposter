import type { AnimationConfiguration } from "#src/models/configuration/shared/AnimationConfiguration";
import type { SpriteEventEmitsOptions } from "#src/models/emit/SpriteEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { Animations } from "phaser";

// This setter's own completion listener, per sprite and per event. `off(event)` with no callback would take the
// Consumer's listeners for the same animation with it, and a published package cannot know what a consumer
// Attached; keyed by the game object so a destroyed sprite takes its entry with it.
const completionListeners = new WeakMap<GameObjects.Sprite, Map<string, () => void>>();

export const AnimationSetterMap = {
  animations: (gameObject, emit) => (configurations) => {
    if (!(configurations && configurations.length > 0)) return;

    const listeners = completionListeners.get(gameObject) ?? new Map<string, () => void>();
    completionListeners.set(gameObject, listeners);

    for (const configuration of configurations) {
      if (!configuration.key) continue;
      const event = `${Animations.Events.ANIMATION_COMPLETE_KEY}${configuration.key}`;
      // Re-running this setter before a prior animation completes must not stack a second listener for the same key
      const previousListener = listeners.get(event);
      if (previousListener) gameObject.off(event, previousListener);

      const listener = () => {
        // @ts-expect-error valid runtime event that phaser has no type for
        emit(event);
      };
      listeners.set(event, listener);
      gameObject.once(event, listener);

      if (gameObject.scene.anims.exists(configuration.key)) continue;
      if (!gameObject.scene.anims.create(configuration))
        throw new InvalidOperationError(Operation.Create, "Animation", configuration.key);
    }
  },
  playAnimationKey: (gameObject) => (value) => {
    if (value === undefined) {
      gameObject.stop();
      return;
    }

    gameObject.play(value);
  },
} as const satisfies SetterMap<AnimationConfiguration, GameObjects.Sprite, SpriteEventEmitsOptions>;
