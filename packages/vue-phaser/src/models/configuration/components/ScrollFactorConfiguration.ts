import type { ExcludeFunctionProperties } from "@/utils/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type ScrollFactorConfiguration = ExcludeFunctionProperties<
  { scrollFactor: number } & GameObjects.Components.ScrollFactor
>;
