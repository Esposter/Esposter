import type { TweenBuilderConfiguration } from "@/models/configuration/shared/TweenBuilderConfiguration";

export interface TweenConfiguration {
  tween: TweenBuilderConfiguration;
  tweenchain: TweenBuilderConfiguration[];
}
