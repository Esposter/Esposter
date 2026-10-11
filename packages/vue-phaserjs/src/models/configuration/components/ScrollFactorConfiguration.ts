import type { FunctionLike } from "@esposter/shared";
import type { ConditionalExcept } from "type-fest";
import type { GameObjects } from "phaser";

export interface ScrollFactorConfiguration extends ConditionalExcept<
  GameObjects.Components.ScrollFactor,
  FunctionLike
> {
  scrollFactor: number;
}
