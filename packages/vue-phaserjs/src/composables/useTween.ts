import type { TweenBuilderConfiguration } from "#src/models/configuration/shared/TweenBuilderConfiguration";

export const useTween = (tween: Ref<TweenBuilderConfiguration | undefined>, newTween: TweenBuilderConfiguration) => {
  tween.value = {
    ...newTween,
    onComplete: (...args) => {
      tween.value = undefined;
      newTween.onComplete?.(...args);
    },
  };
};
