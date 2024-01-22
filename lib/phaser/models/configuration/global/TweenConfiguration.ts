import { type Types } from "phaser";

export interface TweenConfiguration {
  tween?: Types.Tweens.TweenBuilderConfig;
  tweenchain?: Types.Tweens.TweenBuilderConfig[];
}
