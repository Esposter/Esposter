import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export interface OriginConfiguration extends ExcludeFunctionProperties<GameObjects.Components.Origin> {
  origin: number;
}
