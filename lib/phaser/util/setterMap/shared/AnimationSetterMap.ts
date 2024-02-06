import { type AnimationConfiguration } from "@/lib/phaser/models/configuration/shared/AnimationConfiguration";
import { type SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { type SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import { Animations, type GameObjects } from "phaser";

export const AnimationSetterMap = {
  animation: (gameObject, emit) =>
    createAnimation<Animations.Animation, AnimationConfiguration["animation"]>((configuration) => {
      const animation = gameObject.scene.anims.create(configuration);
      if (!animation) throw new Error(`Invalid animation key: ${configuration.key}`);
      const event = `${Animations.Events.ANIMATION_COMPLETE_KEY}${configuration.key}`;
      gameObject.once(event, () => emit(event));
      return animation;
    }),
  animations: (gameObject, emit) =>
    createAnimations<Animations.Animation, AnimationConfiguration["animations"]>((configurations) => {
      const animations: Animations.Animation[] = [];
      for (const configuration of configurations) {
        const animation = gameObject.scene.anims.create(configuration);
        if (!animation) throw new Error(`Invalid animation key: ${configuration.key}`);
        const event = `${Animations.Events.ANIMATION_COMPLETE_KEY}${configuration.key}`;
        gameObject.once(event, () => emit(event));
        animations.push(animation);
      }
      return animations;
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

const createAnimations = <TAnimation extends { destroy: () => void }, TConfigurations extends object[]>(
  callback: (configurations: TConfigurations) => TAnimation[],
) => {
  let previousAnimations: TAnimation[] = [];
  return (configurations?: TConfigurations) => {
    for (const previousAnimation of previousAnimations) previousAnimation.destroy();
    previousAnimations = configurations ? callback(configurations) : [];
  };
};
