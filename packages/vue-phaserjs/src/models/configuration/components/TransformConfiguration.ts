import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export type TransformConfiguration = ExcludeFunctionProperties<GameObjects.Components.Transform>;
