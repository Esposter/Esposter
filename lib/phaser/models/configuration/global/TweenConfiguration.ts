import { type Types } from "phaser";

export interface TweenConfiguration {
  tween?: Types.Tweens.TweenBuilderConfig;
  tweens?: Types.Tweens.TweenBuilderConfig[];
  timeline?: Types.Time.TimelineEventConfig;
}
