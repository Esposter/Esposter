import type { Except } from "@/util/types/Except";
import type { Types } from "phaser";

export type TweenBuilderConfiguration = Except<Types.Tweens.TweenBuilderConfig, "targets">;
