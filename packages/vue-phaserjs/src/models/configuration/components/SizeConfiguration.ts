import type { FunctionLike } from "@esposter/shared";
import type { ConditionalExcept } from "type-fest";
import type { GameObjects } from "phaser";

export interface SizeConfiguration extends ConditionalExcept<GameObjects.Components.Size, FunctionLike> {}
