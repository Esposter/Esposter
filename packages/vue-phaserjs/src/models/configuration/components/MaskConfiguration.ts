import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface MaskConfiguration extends ConditionalExcept<GameObjects.Components.Mask, FunctionLike> {}
