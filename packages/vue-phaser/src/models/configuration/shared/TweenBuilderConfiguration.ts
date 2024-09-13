import type { Types } from "phaser";
import type { Except } from "type-fest";

export type TweenBuilderConfiguration = Except<Types.Tweens.TweenBuilderConfig, "targets">;
