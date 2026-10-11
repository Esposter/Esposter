import type { FunctionLike } from "@esposter/shared";
import type { ConditionalExcept } from "type-fest";
import type { GameObjects } from "phaser";

export interface RenderNodesConfiguration extends ConditionalExcept<GameObjects.Components.RenderNodes, FunctionLike> {}
