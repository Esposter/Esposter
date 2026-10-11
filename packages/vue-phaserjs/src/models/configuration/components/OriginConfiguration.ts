import type { FunctionLike } from "@esposter/shared";
import type { ConditionalExcept } from "type-fest";
import type { GameObjects } from "phaser";

export interface OriginConfiguration extends ConditionalExcept<GameObjects.Components.Origin, FunctionLike> {
  origin: number;
}
