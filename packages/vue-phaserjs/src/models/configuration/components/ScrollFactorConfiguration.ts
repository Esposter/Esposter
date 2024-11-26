import type { ExcludeFunctionProperties } from "@/util/types/ExcludeFunctionProperties";
import type { GameObjects } from "phaser";

export type ScrollFactorConfiguration = ExcludeFunctionProperties<
  GameObjects.Components.ScrollFactor & { scrollFactor: number }
>;
