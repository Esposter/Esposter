import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface ScrollFactorConfiguration extends ConditionalExcept<
  GameObjects.Components.ScrollFactor,
  FunctionLike
> {
  scrollFactor: number;
}
