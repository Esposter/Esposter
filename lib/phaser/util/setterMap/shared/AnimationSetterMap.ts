import type { AnimationConfiguration } from "@/lib/phaser/models/configuration/shared/AnimationConfiguration";
import type { SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
import type { GameObjects } from "phaser";
import { Animations } from "phaser";

export const AnimationSetterMap = {
  animations: (gameObject, emit) => (configurations) => {
    if (!(configurations && configurations.length > 0)) return;

    for (const configuration of configurations) {
      if (!configuration.key) continue;
      const event = `${Animations.Events.ANIMATION_COMPLETE_KEY}${configuration.key}`;
      gameObject.once(event, () => {
        emit(event);
      });

      if (gameObject.scene.anims.exists(configuration.key)) continue;
      else if (!gameObject.scene.anims.create(configuration))
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
