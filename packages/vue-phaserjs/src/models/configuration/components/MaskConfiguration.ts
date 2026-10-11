import type { FunctionLike } from "@esposter/shared";
import type { ConditionalExcept } from "type-fest";
import type { GameObjects } from "phaser";

export interface MaskConfiguration extends ConditionalExcept<GameObjects.Components.Mask, FunctionLike> {}
