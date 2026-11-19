import type { TweenBuilderConfiguration } from "#src/models/configuration/shared/TweenBuilderConfiguration";

import { useTween } from "#src/composables/useTween";

// Resolves once the tween completes, after the caller's own onComplete has run
export const useTweenAsync = (tween: Ref<TweenBuilderConfiguration | undefined>, newTween: TweenBuilderConfiguration) =>
  new Promise<void>((resolve) => {
    useTween(tween, {
      ...newTween,
      onComplete: (...args) => {
        newTween.onComplete?.(...args);
        resolve();
      },
    });
  });
