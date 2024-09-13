import type { ExcludeFunctionProperties } from "@/utils/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type TransformConfiguration = ExcludeFunctionProperties<GameObjects.Components.Transform>;
