import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface AlphaConfiguration extends ConditionalExcept<GameObjects.Components.Alpha, FunctionLike> {}
