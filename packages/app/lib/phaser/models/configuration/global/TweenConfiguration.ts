import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";

export interface TweenConfiguration {
  tween: TweenBuilderConfiguration;
  tweenchain: TweenBuilderConfiguration[];
}
