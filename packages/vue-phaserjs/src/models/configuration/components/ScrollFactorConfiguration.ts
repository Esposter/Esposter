import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export interface ScrollFactorConfiguration extends ExcludeFunctionProperties<GameObjects.Components.ScrollFactor> {
  scrollFactor: number;
}
