import type { ExcludeFunctionProperties } from "@/util/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type OriginConfiguration = ExcludeFunctionProperties<{ origin: number } & GameObjects.Components.Origin>;
