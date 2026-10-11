import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface FlipConfiguration extends ConditionalExcept<GameObjects.Components.Flip, FunctionLike> {}
