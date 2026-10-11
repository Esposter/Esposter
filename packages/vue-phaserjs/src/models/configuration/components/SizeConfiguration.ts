import type { FunctionLike } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { ConditionalExcept } from "type-fest";

export interface SizeConfiguration extends ConditionalExcept<GameObjects.Components.Size, FunctionLike> {}
