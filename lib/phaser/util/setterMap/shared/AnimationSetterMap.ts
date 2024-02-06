import { type AnimationConfiguration } from "@/lib/phaser/models/configuration/shared/AnimationConfiguration";
import { type SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { type Animations, type GameObjects } from "phaser";

export const AnimationSetterMap = {
  anims: (gameObject) =>
    createAnimation<Animations.Animation, AnimationConfiguration["anims"]>((configuration) => {
      const animation = gameObject.scene.anims.create(configuration);
      if (!animation) throw new Error("Invalid animation key");
      return animation;
    }),
  playAnimationKey: (gameObject) => (value) => {
    if (value === undefined) {
      gameObject.stop();
      return;
    }

    gameObject.play(value);
  },
} satisfies SetterMap<AnimationConfiguration, GameObjects.Sprite, SpriteEventEmitsOptions>;

const createAnimation = <TAnimation extends { destroy: () => void }, TConfiguration extends object>(
  callback: (configuration: TConfiguration) => TAnimation,
) => {
  let previousAnimation: TAnimation | undefined;
  return (configuration?: TConfiguration) => {
    if (previousAnimation) previousAnimation.destroy();
    previousAnimation = configuration ? callback(configuration) : undefined;
  };
};
