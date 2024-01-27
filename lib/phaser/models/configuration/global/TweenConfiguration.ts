import { type TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/components/TweenBuilderConfiguration";

export interface TweenConfiguration {
  tween: TweenBuilderConfiguration;
  tweenchain: TweenBuilderConfiguration[];
}
