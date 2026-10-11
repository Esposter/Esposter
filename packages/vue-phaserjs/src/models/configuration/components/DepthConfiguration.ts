import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface DepthConfiguration extends ConditionalExcept<GameObjects.Components.Depth, FunctionLike> {}
