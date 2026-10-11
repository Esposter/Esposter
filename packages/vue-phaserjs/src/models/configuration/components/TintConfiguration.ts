import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface TintConfiguration extends ConditionalExcept<GameObjects.Components.Tint, FunctionLike> {}
