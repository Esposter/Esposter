import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export type OriginConfiguration = ExcludeFunctionProperties<GameObjects.Components.Origin & { origin: number }>;
