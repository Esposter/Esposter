import type { ExcludeFunctionProperties } from "@/utils/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type OriginConfiguration = ExcludeFunctionProperties<GameObjects.Components.Origin & { origin: number }>;
