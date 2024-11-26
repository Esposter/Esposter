import type { ExcludeFunctionProperties } from "@/util/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type TransformConfiguration = ExcludeFunctionProperties<GameObjects.Components.Transform>;
