import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export interface TransformConfiguration extends ExcludeFunctionProperties<GameObjects.Components.Transform> {}
