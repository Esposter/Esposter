import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";

export type ScrollFactorConfiguration = ExcludeFunctionProperties<
  GameObjects.Components.ScrollFactor & { scrollFactor: number }
>;
