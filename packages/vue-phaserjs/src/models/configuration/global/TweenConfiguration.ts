import type { TweenBuilderConfiguration } from "#src/models/configuration/shared/TweenBuilderConfiguration";

export interface TweenConfiguration {
  tween: TweenBuilderConfiguration;
  tweenchain: TweenBuilderConfiguration[];
}
