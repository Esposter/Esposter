import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface OriginConfiguration extends ConditionalExcept<GameObjects.Components.Origin, FunctionLike> {
  origin: number;
}
