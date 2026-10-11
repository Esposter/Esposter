import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface VisibleConfiguration extends ConditionalExcept<GameObjects.Components.Visible, FunctionLike> {}
