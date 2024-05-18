import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";

export const useTween = (
  tween: Ref<TweenBuilderConfiguration | undefined>,
  configuration: TweenBuilderConfiguration,
) => {
  tween.value = {
    ...configuration,
    onComplete: (...args) => {
      tween.value = undefined;
      configuration.onComplete?.(...args);
    },
  };
};
