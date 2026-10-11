import type { FunctionLike } from "@esposter/shared";
import type { ConditionalExcept } from "type-fest";
import type { GameObjects } from "phaser";

export interface AlphaSingleConfiguration extends ConditionalExcept<GameObjects.Components.AlphaSingle, FunctionLike> {}
